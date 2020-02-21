import suite from "../lib/index";
import Suite from "../lib/Suite";

export default suite(({ beforeEach, test }) => {
  const expectedTestName = "test name";
  const expectedFn = _ => {};

  /**
   * @type {Suite}
   */
  let testSuite;

  beforeEach(() => {
    testSuite = new Suite();
  });

  test("suite should return a suite", _ => {
    _.assert(suite(() => {}) instanceof Suite);
  });

  test("suite should callback with created suite", _ => {
    const spy = _.spy();

    suite(spy);

    _.assertEqual(1, spy.calls.length);
    _.assert(spy.calls[0][0] instanceof Suite);
  });

  test("static new method should return a suite", _ => {
    _.assert(Suite.new instanceof Suite);
  });

  test("should have no tests", _ => {
    _.assertEqual(testSuite.tests.length, 0);
  });

  test("test should add a test", _ => {
    const expectedTestName = "test name";
    const expectedTestRunState = "Run";

    testSuite.test(expectedTestName, expectedFn);

    _.assertEqual(expectedTestName, testSuite.tests[0].description);
    _.assertEqual(expectedFn, testSuite.tests[0].fn);
    _.assertEqual(expectedTestRunState, testSuite.tests[0].state);
  });

  test("skip should add a skipped test", _ => {
    const expectedTestRunState = "Skip";

    testSuite.skip(expectedTestName, expectedFn);

    _.assertEqual(expectedTestName, testSuite.tests[0].description);
    _.assertEqual(expectedFn, testSuite.tests[0].fn);
    _.assertEqual(expectedTestRunState, testSuite.tests[0].state);
  });

  test("todo should add a todo test", _ => {
    const expectedTestRunState = "Todo";

    testSuite.todo(expectedTestName);

    _.assertEqual(expectedTestName, testSuite.tests[0].description);
    _.assertEqual(expectedTestRunState, testSuite.tests[0].state);
  });

  test("should have no beforeEachs", _ => {
    _.assertEqual(testSuite.beforeEachs.length, 0);
  });

  test("beforeEach should add a beforeEach", _ => {
    testSuite.beforeEach(expectedFn);

    _.assertEqual(1, testSuite.beforeEachs.length);
    _.assertEqual(expectedFn, testSuite.beforeEachs[0]);
  });

  test("should have no afterEachs", _ => {
    _.assertEqual(testSuite.afterEachs.length, 0);
  });

  test("afterEach should add a afterEach", _ => {
    testSuite.afterEach(expectedFn);

    _.assertEqual(1, testSuite.afterEachs.length);
    _.assertEqual(expectedFn, testSuite.afterEachs[0]);
  });

  test("should have no beforeAlls", _ => {
    _.assertEqual(testSuite.beforeAlls.length, 0);
  });

  test("beforeEach should add a beforeEach", _ => {
    testSuite.beforeAll(expectedFn);

    _.assertEqual(1, testSuite.beforeAlls.length);
    _.assertEqual(expectedFn, testSuite.beforeAlls[0]);
  });

  test("should have no afterAlls", _ => {
    _.assertEqual(testSuite.afterAlls.length, 0);
  });

  test("afterAll should add a afterAll", _ => {
    testSuite.afterAll(expectedFn);

    _.assertEqual(1, testSuite.afterAlls.length);
    _.assertEqual(expectedFn, testSuite.afterAlls[0]);
  });
});
