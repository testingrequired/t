import assert, { AssertionError } from "assert";
import Suite from "./Suite";
import { TestResultStateAndMessage, TestResult } from "./Test";
import createSpy from "./spy";

export default function runSuiteTests(suite: Suite): TestResult {
  const testResults: TestResult = suite.tests.reduce(
    (results, { description, fn, state }) => {
      let result: TestResultStateAndMessage;

      switch (state) {
        case "Skip":
          result = ["Skip"];
          break;
        case "Todo":
          result = ["Todo"];
          break;
        default:
          try {
            suite.beforeEachs.forEach(fn => fn());

            fn({
              assert,
              assertEqual: assert.strictEqual,
              spy: createSpy
            });

            result = ["Pass"];
          } catch (e) {
            result = [
              e instanceof AssertionError ? "Fail" : "Error",
              e.message
            ];
          }
      }

      return { ...results, [description]: result };
    },
    {}
  );

  return testResults;
}
