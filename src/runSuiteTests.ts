import assert, { AssertionError } from "assert";
import Suite from "./Suite";
import { TestResult, TestFunctionArg, TestFunction } from "./Test";
import createSpy from "./spy";

export default function runSuiteTests(
  suite: Suite
): Record<string, [TestResult, string?]> {
  const testResults: Record<string, [TestResult, string?]> = suite.tests.reduce(
    (results, { description, fn, state }) => {
      let result;

      switch (state) {
        case "Skip":
          result = { [description]: ["Skip"] };
          break;
        case "Todo":
          result = { [description]: ["Todo"] };
          break;
        default:
          result = { [description]: suiteTest(suite, fn) };
      }

      return { ...results, ...result };
    },
    {}
  );

  function suiteTest(suite: Suite, fn: TestFunction) {
    try {
      suite.beforeEachs.forEach(fn => fn());

      const fnArg: TestFunctionArg = {
        assert,
        assertEqual: assert.strictEqual,
        spy: createSpy
      };

      fn(fnArg);

      return ["Pass"];
    } catch (e) {
      return [mapErrorToTestResult(e), e.message];
    }
  }

  return testResults;
}

function mapErrorToTestResult(e: Error): TestResult {
  return e instanceof AssertionError ? "Fail" : "Error";
}
