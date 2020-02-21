export default interface Test {
  description: string;
  fn: TestFunction;
  runState: TestRunState;
  skipReason?: string;
}

export enum TestRunState {
  Run = "Run",
  Skip = "Skip",
  Todo = "Todo"
}

export interface TestFunction {
  (_: TestFunctionArg): void;
}

export interface TestFunctionArg {
  assert(value: boolean, message?: string): void;
  assertEqual<T>(expected: T, actual: T, message?: string): void;
  spy: () => Function;
}

export type TestResultState = "Pass" | "Fail" | "Error" | "Skip" | "Todo";

export interface TestResult {
  description: string;
  resultState: TestResultState;
  resultMessage?: string;
}
