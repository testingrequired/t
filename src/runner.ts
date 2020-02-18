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

  const testResults: TestResult[] = suite.tests.map(
    ([description, fn, state]) => {
      if (state === "Skip") {
        return "Skip";
      }

      if (state === "Todo") {
        return "Todo";
      }

      try {
        fn({ assert, assertEqual: assert.strictEqual });
        return "Pass";
      } catch (e) {
        if (e instanceof AssertionError) {
          return "Fail";
        } else {
          return "Error";
        }
      }
    }
  );

  const result: Result = {
    testCount: suite.tests.length,
    testResults: testResults
  };

  parentPort?.postMessage(JSON.stringify(result));
}

interface Result {
  testCount: number;
  testResults: string[];
}

type TestResult = "Pass" | "Fail" | "Error" | "Skip" | "Todo";
