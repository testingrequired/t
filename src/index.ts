export type TestFunction = (_: TestFunctionArg) => void;

export interface TestFunctionArg {
  assert(value: boolean, message?: string): void;
  assertEqual<T>(expected: T, actual: T, message?: string): void;
}

export interface TestOptions {
  skip: boolean | string;
}

export class Suite {
  #tests: [string, TestFunction, TestOptions?][];
  #beforeAll: Array<() => void>;
  #beforeEach: Array<() => void>;
  #afterEach: Array<() => void>;
  #afterAll: Array<() => void>;

  constructor() {
    this.#tests = [];
    this.#beforeAll = [];
    this.#beforeEach = [];
    this.#afterEach = [];
    this.#afterAll = [];
  }

  beforeAll(fn: () => void): this {
    this.#beforeAll.push(fn);
    return this;
  }

  beforeEach(fn: () => void): this {
    this.#beforeEach.push(fn);
    return this;
  }

  afterEach(fn: () => void): this {
    this.#afterEach.push(fn);
    return this;
  }

  afterAll(fn: () => void): this {
    this.#afterAll.push(fn);
    return this;
  }

  test(description: string, fn: TestFunction, options?: TestOptions): this {
    this.#tests.push([description, fn, options]);
    return this;
  }
}
