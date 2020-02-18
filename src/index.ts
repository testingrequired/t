import TestFunction from "./TestFunction";
import TestOptions from "./TestOptions";

export class Suite {
  private tests: [string, TestFunction, TestOptions?][];
  private beforeAlls: Array<() => void>;
  private beforeEachs: Array<() => void>;
  private afterEachs: Array<() => void>;
  private afterAlls: Array<() => void>;

  constructor() {
    this.tests = [];
    this.beforeAlls = [];
    this.beforeEachs = [];
    this.afterEachs = [];
    this.afterAlls = [];
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

  test(description: string, fn: TestFunction, options?: TestOptions): this {
    this.tests.push([description, fn, options]);
    return this;
  }
}
