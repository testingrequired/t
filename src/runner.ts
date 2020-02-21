import { Worker, isMainThread, workerData, parentPort } from "worker_threads";
import path from "path";
import { promisify } from "util";
import glob from "glob";
import Suite from "./Suite";
import Config from "./Config";
import runSuiteTests from "./runSuiteTests";
import getTrcConfig from "./getTrcConfig";

if (isMainThread) {
  const trcPath = path.join(process.cwd(), ".trc");

  (async () => {
    let trcConfig: Config;

    try {
      trcConfig = await getTrcConfig(trcPath);
    } catch (e) {
      console.log(`Error occurred reading .trc file: ${e.message}`);
      process.exit(1);
    }

    const pattern = await getPattern(trcConfig);

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
      testFilePaths.map(mapTestFilePathToWorker)
    );

    const resultsFormatted = results.reduce(
      (acc: object, item, i) => ({ ...acc, [testFilePaths[i]]: item }),
      {}
    );

    console.log(resultsFormatted);
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

  parentPort?.postMessage(testResults);
}

async function getPattern(trcConfig: Config) {
  const [patternFromArgs] = process.argv.slice(2);
  return patternFromArgs ?? trcConfig.pattern;
}

function mapTestFilePathToWorker(testFilePath: string) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__filename, {
      workerData: testFilePath
    });

    worker.on("message", resolve);

    worker.on("error", reject);

    worker.on("exit", code =>
      reject(`This shouldn't happen: ${testFilePath} exited with ${code}`)
    );
  });
}
