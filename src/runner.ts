import { Worker, isMainThread, workerData, parentPort } from "worker_threads";
import { Suite } from "./index";
import path from "path";
import assert, { AssertionError } from "assert";

if (isMainThread) {
  const testFilePaths = process.argv.slice(2);

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
} else {
  const suite: Suite = require(path.join(process.cwd(), workerData));

  suite.beforeAlls.forEach(fn => fn());

  const testResults: Record<string, [TestResult, string?]> = suite.tests.reduce(
    (results, [description, fn, state]) => {
      switch (state) {
        case "Skip":
          return { ...results, [description]: ["Skip"] };

        case "Todo":
          return { ...results, [description]: ["Todo"] };

        default:
          try {
            suite.beforeEachs.forEach(fn => fn());
            fn({ assert, assertEqual: assert.strictEqual });
            suite.afterEachs.forEach(fn => fn());
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

  suite.afterAlls.forEach(fn => fn());

  parentPort?.postMessage(JSON.stringify(testResults));
}

type TestResult = "Pass" | "Fail" | "Error" | "Skip" | "Todo";
