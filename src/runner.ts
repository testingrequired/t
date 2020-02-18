import { Worker, isMainThread, workerData } from "worker_threads";
import { Suite } from "./index";
import path from "path";

if (isMainThread) {
  const testFilePaths = process.argv.slice(2);

  testFilePaths.forEach(testFilePath => {
    const worker = new Worker(__filename, { workerData: testFilePath });

    worker.on("message", message => {
      console.log(`${testFilePath}: message: ${message}`);
    });

    worker.on("error", error => {
      console.log(`${testFilePath}: error: ${error}`);
    });

    worker.on("exit", code => {
      console.log(`${testFilePath}: exit: ${code}`);
    });
  });
} else {
  const suite: Suite = require(path.join(process.cwd(), workerData));

  console.log(suite.tests);
}
