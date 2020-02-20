import { Worker, isMainThread, workerData, parentPort } from "worker_threads";
import assert, { AssertionError } from "assert";
import path from "path";
import fs from "fs";
import { promisify } from "util";
import glob from "glob";
import Suite from "./Suite";
import { TestResult } from "./Test";
import { Config } from "./Config";
import createSpy from "./spy";

if (isMainThread) {
  (async () => {
    const [patternFromArgs] = process.argv.slice(2);

    let trcConfig: Config;

    try {
      const trcPath = path.join(process.cwd(), ".trc");
      trcConfig = await getTrcConfig(trcPath);
    } catch (e) {
      console.log(`Error occurred reading .trc file: ${e.message}`);
      process.exit(1);
    }

    const pattern = patternFromArgs ?? trcConfig?.pattern;

    if (!pattern) {
      console.log(
        `Test file pattern could not be determined from a .trc file or from runner args`
      );
      process.exit(1);
    }

    const testFilePaths = await promisify(glob)(pattern);

    const results = await Promise.all(
      testFilePaths.map(testFilePath => {
        return new Promise((resolve, reject) => {
          const worker = new Worker(__filename, {
            workerData: testFilePath
          });

          worker.on("message", message => resolve(JSON.parse(message)));

          worker.on("error", error => reject(error));

          worker.on("exit", code =>
            reject(`This shouldn't happen: ${testFilePath} exited with ${code}`)
          );
        });
      })
    );

    console.log(
      results.reduce((acc: object, item, i) => {
        return { ...acc, [testFilePaths[i]]: item };
      }, {})
    );
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
  if (!(await promisify(fs.exists)(trcPath))) return {};

  return JSON.parse(
    await promisify(fs.readFile)(trcPath, { encoding: "utf8" })
  );
}

export function runSuiteTests(
  suite: Suite
): Record<string, [TestResult, string?]> {
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
            fn({ assert, assertEqual: assert.strictEqual, spy: createSpy });
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
