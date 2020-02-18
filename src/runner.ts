import { Worker, isMainThread, workerData } from "worker_threads";
import { Suite } from "./index";
import path from "path";

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
          reject(`${testFilePath}: error: ${error}`);
        });

        worker.on("exit", code => {
          resolve(`${testFilePath}: exit: ${code}`);
        });
      });
    })
  ).then((...value) => {
    console.log(value);
  });
} else {
  const suite: Suite = require(path.join(process.cwd(), workerData));

  console.log(suite.tests);
}
