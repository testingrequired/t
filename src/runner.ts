import { Worker, isMainThread } from "worker_threads";

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
}
