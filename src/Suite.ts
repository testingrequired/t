import Test, { TestFunction, TestRunState } from "./Test";

export default class Suite {
  public tests: Test[];
  public beforeAlls: Array<() => void>;
  public beforeEachs: Array<() => void>;
  public afterEachs: Array<() => void>;
  public afterAlls: Array<() => void>;
  constructor() {
    this.tests = [];
    this.beforeAlls = [];
    this.beforeEachs = [];
    this.afterEachs = [];
    this.afterAlls = [];
  }
  static init(fn: (suite: Suite) => void): Suite {
    const suite = new Suite();
    fn.call(null, suite);
    return suite;
  }
  beforeAll(fn: () => void): this {
    this.beforeAlls.push(fn);
    return this;
  }
  beforeEach(fn: () => void): this {
    this.beforeEachs.push(fn);
    return this;
  }
  afterEach(fn: () => void): this {
    this.afterEachs.push(fn);
    return this;
  }
  afterAll(fn: () => void): this {
    this.afterAlls.push(fn);
    return this;
  }
  test(description: string, fn: TestFunction): this {
    this.tests.push({ description, fn, state: TestRunState.Run });
    return this;
  }
  skip(description: string, fn: TestFunction): this {
    this.tests.push({ description, fn, state: TestRunState.Skip });
    return this;
  }
  todo(description: string): this {
    this.tests.push({ description, fn: () => {}, state: TestRunState.Todo });
    return this;
  }
}
