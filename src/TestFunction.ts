export default interface TestFunction {
  (_: TestFunctionArg): void;
}

export interface TestFunctionArg {
  assert(value: boolean, message?: string): void;
  assertEqual<T>(expected: T, actual: T, message?: string): void;
}
