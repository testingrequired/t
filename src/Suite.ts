import Test, { TestFunction, TestRunState } from "./Test";

export const createSuite = (fn: (s: Suite) => void): Suite => {
  const suite = new Suite();

  fn.call(null, suite);

  return suite;
};

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

    this.test = this.test.bind(this);
    this.skip = this.skip.bind(this);
    this.todo = this.todo.bind(this);
    (this.test as any).skip = this.skip;
    (this.test as any).todo = this.todo;

    this.beforeAll = this.beforeAll.bind(this);
    this.beforeEach = this.beforeEach.bind(this);
    this.afterEach = this.afterEach.bind(this);
    this.afterAll = this.afterAll.bind(this);
  }

  static get new() {
    return new Suite();
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
    this.tests.push({ description, fn, runState: TestRunState.Run });
    return this;
  }

  skip(description: string, fn: TestFunction): this {
    this.tests.push({ description, fn, runState: TestRunState.Skip });
    return this;
  }

  todo(description: string): this {
    this.tests.push({ description, fn: () => {}, runState: TestRunState.Todo });
    return this;
  }
}
