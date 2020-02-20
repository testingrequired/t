import { Worker, isMainThread, workerData, parentPort } from "worker_threads";
import assert, { AssertionError } from "assert";
import path from "path";
import fs from "fs";
import { promisify } from "util";
import glob from "glob";
import Suite from "./Suite";
import { TestResult } from "./Test";
import { Config } from "./Config";

if (isMainThread) {
  (async () => {
    const [patternFromArgs] = process.argv.slice(2);

    const trcPath = path.join(process.cwd(), ".trc");
    const trcConfig = await getTrcConfig(trcPath);

    const pattern = trcConfig?.pattern ?? patternFromArgs;

    const testFilePaths = await promisify(glob)(pattern);

    try {
      console.log(
        await Promise.all(
          testFilePaths.map(testFilePath => {
            return new Promise((resolve, reject) => {
              const worker = new Worker(__filename, {
                workerData: testFilePath
              });

              worker.on("message", message => {
                resolve(`${testFilePath}: message: ${message}`);
              });

              worker.on("error", error => {
                console.log(error);
                reject(`${testFilePath}: error: ${error.message}`);
              });

              worker.on("exit", code => {
                resolve(`${testFilePath}: exit: ${code}`);
              });
            });
          })
        )
      );
    } catch (e) {
      console.log(`ERROR: ${JSON.stringify(e)}`);
    }
  })();
} else {
  const suiteModule: any = require(path.join(process.cwd(), workerData));

  let suite: Suite;

  if (suiteModule.default) {
    suite = suiteModule.default;
  } else {
    suite = suiteModule;
  }

  const testResults = runSuiteTests(suite);

  parentPort?.postMessage(JSON.stringify(testResults));
}

async function getTrcConfig(trcPath: string): Promise<Config> {
  const trcExists = await promisify(fs.exists)(trcPath);
  let trcConfig: Config;

  if (!trcExists) return {};

  try {
    const encoding = "utf8";
    trcConfig = JSON.parse(await promisify(fs.readFile)(trcPath, { encoding }));
  } catch (e) {
    trcConfig = {};
  }

  return trcConfig;
}

function runSuiteTests(suite: Suite): Record<string, [TestResult, string?]> {
  const testResults: Record<string, [TestResult, string?]> = suite.tests.reduce(
    (results, { description, fn, state }) => {
      switch (state) {
        case "Skip":
          return { ...results, [description]: ["Skip"] };

        case "Todo":
          return { ...results, [description]: ["Todo"] };

        default:
          try {
            suite.beforeEachs.forEach(fn => fn());
            fn({ assert, assertEqual: assert.strictEqual });
            return { ...results, [description]: ["Pass"] };
          } catch (e) {
            return {
              ...results,
              [description]: [
                e instanceof AssertionError ? "Fail" : "Error",
                e.message
              ]
            };
          }
      }
    },
    {}
  );

  return testResults;
}
