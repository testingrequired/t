import { Worker, isMainThread, workerData, parentPort } from "worker_threads";
import path from "path";
import { promisify } from "util";
import glob from "glob";
import Suite from "./Suite";
import TrcFile from "./TrcFile";
import runSuiteTests from "./runSuiteTests";
import getTrcFile from "./getTrcConfig";
import { TestResult, TestResultState } from "./Test";
const pkg = require("../package.json");
const chalk = require("chalk");

isMainThread ? mainThread() : debugThread();

async function mainThread() {
  console.log(`${chalk.bold("t")} ${pkg.version}`);
  console.log();

  let trcFile: TrcFile;

  try {
    trcFile = await getTrcFile(path.join(process.cwd(), ".trc"));
  } catch (e) {
    console.log(`Error occurred reading .trc file: ${e.message}`);
    process.exit(1);
  }

  const [patternFromArgs] = process.argv.slice(2);
  const pattern = patternFromArgs ?? trcFile.pattern;

  if (!pattern) {
    console.log(
      chalk.red(
        `${chalk.bold(
          "Error:"
        )} Test file pattern could not be determined from a .trc file or from runner args`
      )
    );
    process.exit(1);
  }

  const testFilePaths = await promisify(glob)(pattern);

  if (testFilePaths.length === 0) {
    console.log(`Test file pattern ${pattern} returned no test files`);
    process.exit(1);
  }

  const results = await Promise.all<Array<TestResult>>(
    testFilePaths.map(
      testFilePath =>
        new Promise((resolve, reject) => {
          const worker = new Worker(__filename, {
            workerData: testFilePath
          });

          worker.on("message", resolve);

          worker.on("error", reject);

          worker.on("exit", code =>
            reject(`This shouldn't happen: ${testFilePath} exited with ${code}`)
          );
        })
    )
  );

  const resultsFormatted = results.reduce<Record<string, Array<TestResult>>>(
    (acc: object, item, i) => ({ ...acc, [testFilePaths[i]]: item }),
    {}
  );

  testFilePaths.forEach(testFilePath => {
    console.log(chalk.underline(testFilePath));

    const testFileResults = resultsFormatted[testFilePath];

    console.log(testFileResults.map(formatTestResult).join("\n"));
    console.log();
  });

  const allTestFileResults = Object.values(resultsFormatted).flat();

  const total = allTestFileResults.length;
  const passed = allTestFileResults.filter(x => x.resultState === "Pass")
    .length;
  const failed = allTestFileResults.filter(x => x.resultState === "Fail")
    .length;
  const errored = allTestFileResults.filter(x => x.resultState === "Error")
    .length;
  const skipped = allTestFileResults.filter(x => x.resultState === "Skip")
    .length;
  const todod = allTestFileResults.filter(x => x.resultState === "Todo").length;

  console.log("Counts");

  const tableData = Object.entries({
    total,
    passed,
    failed,
    errored,
    skipped,
    todod
  }).map(([type, count]) => ({ type, count }));

  console.table(tableData);
}

function debugThread() {
  const suiteModule: any = require(path.join(process.cwd(), workerData));

  let suite: Suite;

  if (suiteModule.default) {
    suite = suiteModule.default;
  } else {
    suite = suiteModule;
  }

  const testResults = runSuiteTests(suite);

  parentPort?.postMessage(testResults);
}

function formatTestResult(testResult: TestResult) {
  const { resultState, resultMessage, description } = testResult;

  const glyphs: Record<TestResultState, string> = {
    Error: "@",
    Fail: "!",
    Todo: "*",
    Skip: ">",
    Pass: "."
  };

  const colors: Record<TestResultState, any> = {
    Error: chalk.red,
    Fail: chalk.red,
    Todo: chalk.yellow,
    Skip: chalk.yellow,
    Pass: chalk.green
  };

  return `${glyphs[resultState]} ${description}: ${colors[resultState](
    resultState
  )}${resultMessage ? `\n  ${resultMessage}` : ""}`;
}
