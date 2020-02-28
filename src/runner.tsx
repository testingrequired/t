import { isMainThread, workerData, parentPort, Worker } from "worker_threads";
import path from "path";
import { promisify } from "util";
import glob from "glob";
import React from "react";
import { render, Box, Text } from "ink";
import Suite from "./Suite";
import TrcFile from "./TrcFile";
import runSuiteTests from "./runSuiteTests";
import getTrcFile from "./getTrcConfig";
import { TestResult } from "./Test";
const pkg = require("../package.json");

isMainThread ? mainThread() : debugThread();

async function mainThread() {
  return render(<OutputFn />);
}

function debugThread() {
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

function OutputFn() {
  const [pattern, setPattern] = React.useState<string>();
  const [testFilePaths, setTestFilePaths] = React.useState<Array<string>>();
  const [testResults, setTestResults] = React.useState<Array<TestResult>>();
  const [failedTestResults, setFailedTestResults] = React.useState<
    Array<TestResult>
  >();

  React.useEffect(() => {
    (async () => {
      let trcFile: TrcFile;

      try {
        trcFile = await getTrcFile(path.join(process.cwd(), ".trc"));
      } catch (e) {
        // console.log(`Error occurred reading .trc file: ${e.message}`);
        throw e;
      }

      const [patternFromArgs] = process.argv.slice(2);

      setPattern(patternFromArgs ?? trcFile.pattern);
    })();
  }, []);

  React.useEffect(() => {
    if (pattern) {
      (async () => {
        setTestFilePaths(await promisify(glob)(pattern));
      })();
    }
  }, [pattern]);

  React.useEffect(() => {
    if (testFilePaths) {
      (async () => {
        const results = await Promise.all<Array<TestResult>>(
          testFilePaths.map(
            testFilePath =>
              new Promise((resolve, reject) => {
                new Worker(__filename, {
                  workerData: testFilePath
                })
                  .on("message", resolve)
                  .on("error", reject);
              })
          )
        );

        setTestResults(results.flat());
      })();
    }
  }, [testFilePaths]);

  React.useEffect(() => {
    setFailedTestResults(
      testResults?.filter(result => result.resultState === "Fail")
    );
  }, [testResults]);

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>t</Text> {pkg.version}
      </Box>

      {pattern && <Box>Pattern: {pattern}</Box>}

      {testFilePaths && <Box>Suites: {testFilePaths?.length}</Box>}

      <Box marginTop={1} flexDirection="column">
        {testResults ? (
          <>
            <Box>Results: {testResults.length}</Box>

            <Box>Failures: {failedTestResults?.length}</Box>
          </>
        ) : (
          "Running Tests..."
        )}
      </Box>
    </Box>
  );
}
