import suite from "../lib/index";
import Suite from "../lib/Suite";

export default suite(({ beforeEach, test }) => {
  const expectedFn = _ => {};

  /**
   * @type {Suite}
   */
  let suite;

  beforeEach(() => {
    suite = new Suite();
  });

  test("should have no tests", _ => {
    _.assertEqual(suite.tests.length, 0);
  });

  test("test should add a test", _ => {
    const expectedTestName = "test name";
    const expectedTestRunState = "Run";

    suite.test(expectedTestName, expectedFn);

    _.assertEqual(expectedTestName, suite.tests[0].description);
    _.assertEqual(expectedFn, suite.tests[0].fn);
    _.assertEqual(expectedTestRunState, suite.tests[0].state);
  });

  test("should have no beforeEachs", _ => {
    _.assertEqual(suite.beforeEachs.length, 0);
  });

  test("beforeEach should add a beforeEach", _ => {
    suite.beforeEach(expectedFn);

    _.assertEqual(1, suite.beforeEachs.length);
    _.assertEqual(expectedFn, suite.beforeEachs[0]);
  });

  test("should have no afterEachs", _ => {
    _.assertEqual(suite.afterEachs.length, 0);
  });

  test("afterEach should add a afterEach", _ => {
    suite.afterEach(expectedFn);

    _.assertEqual(1, suite.afterEachs.length);
    _.assertEqual(expectedFn, suite.afterEachs[0]);
  });

  test("should have no beforeAlls", _ => {
    _.assertEqual(suite.beforeAlls.length, 0);
  });

  test("beforeEach should add a beforeEach", _ => {
    suite.beforeAll(expectedFn);

    _.assertEqual(1, suite.beforeAlls.length);
    _.assertEqual(expectedFn, suite.beforeAlls[0]);
  });

  test("should have no afterAlls", _ => {
    _.assertEqual(suite.afterAlls.length, 0);
  });

  test("afterAll should add a afterAll", _ => {
    suite.afterAll(expectedFn);

    _.assertEqual(1, suite.afterAlls.length);
    _.assertEqual(expectedFn, suite.afterAlls[0]);
  });
});
