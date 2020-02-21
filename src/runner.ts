import { Worker, isMainThread, workerData, parentPort } from "worker_threads";
import path from "path";
import { promisify } from "util";
import glob from "glob";
import Suite from "./Suite";
import TrcFile from "./TrcFile";
import runSuiteTests from "./runSuiteTests";
import getTrcFile from "./getTrcConfig";
import { TestResult } from "./Test";

isMainThread ? mainThread() : debugThread();

async function mainThread() {
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
      `Test file pattern could not be determined from a .trc file or from runner args`
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
    console.log(testFilePath);

    const testFileResults = resultsFormatted[testFilePath].map(
      x => `${x.resultState}: ${x.description}`
    );

    console.log(testFileResults);
  });
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
