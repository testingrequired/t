import suite from "../lib/index";

export default suite(({ test, beforeEach }) => {
  let value;

  beforeEach(() => {
    value = 10;
  });

  test("Testing", _ => _.assertEqual(10, value));
});
