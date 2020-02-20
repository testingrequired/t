import { Worker, isMainThread, workerData, parentPort } from "worker_threads";
import assert, { AssertionError } from "assert";
import path from "path";
import { promisify } from "util";
import glob from "glob";
import Suite from "./Suite";
import { TestResult } from "./Test";

if (isMainThread) {
  (async () => {
    const args = process.argv.slice(2);

    const [pattern] = args;

    const testFilePaths = await promisify(glob)(pattern);

    Promise.all(
      testFilePaths.map(testFilePath => {
        return new Promise((resolve, reject) => {
          const worker = new Worker(__filename, { workerData: testFilePath });

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
      .catch(e => {
        console.log(`ERROR: ${JSON.stringify(e)}`);
      })
      .then((...value) => {
        console.log(value);
      });
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
