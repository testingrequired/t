export default interface Test {
  description: string;
  fn: TestFunction;
  state: TestRunState;
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

export type TestResult = "Pass" | "Fail" | "Error" | "Skip" | "Todo";
