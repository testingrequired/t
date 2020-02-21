import { Worker, isMainThread, workerData, parentPort } from "worker_threads";
import path from "path";
import { promisify } from "util";
import glob from "glob";
import Suite from "./Suite";
import Config from "./Config";
import runSuiteTests from "./runSuiteTests";
import getTrcConfig from "./getTrcConfig";

if (isMainThread) {
  (async () => {
    const pattern = await getPattern();

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

async function getPattern() {
  const [patternFromArgs] = process.argv.slice(2);

  let trcConfig: Config;

  try {
    const trcPath = path.join(process.cwd(), ".trc");
    trcConfig = await getTrcConfig(trcPath);
  } catch (e) {
    console.log(`Error occurred reading .trc file: ${e.message}`);
    process.exit(1);
  }

  return patternFromArgs ?? trcConfig.pattern;
}
