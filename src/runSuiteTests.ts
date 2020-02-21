import assert, { AssertionError } from "assert";
import Suite from "./Suite";
import { TestResult } from "./Test";
import createSpy from "./spy";

export default function runSuiteTests(suite: Suite): Array<TestResult> {
  return suite.tests.reduce((results: Array<TestResult>, test) => {
    const { description, fn, runState, skipReason } = test;

    switch (runState) {
      case "Skip":
        return [
          ...results,
          {
            description: description,
            resultState: "Skip",
            resultMessage: skipReason
          }
        ];

      case "Todo":
        return [
          ...results,
          {
            description: description,
            resultState: "Todo"
          }
        ];

      default:
        try {
          suite.beforeEachs.forEach(fn => fn());

          fn({
            assert,
            assertEqual: assert.strictEqual,
            spy: createSpy
          });

          return [
            ...results,
            {
              description: description,
              resultState: "Pass"
            }
          ];
        } catch (e) {
          return [
            ...results,
            {
              description: description,
              resultState: e instanceof AssertionError ? "Fail" : "Error",
              resultMessage: e.message
            }
          ];
        }
    }
  }, []);
}
