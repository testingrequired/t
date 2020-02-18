import Suite from "../lib/index";

let value;

export default Suite.new
  .beforeEach(() => {
    value = 10;
  })
  .test("Testing", _ => {
    _.assertEqual(10, value);
  });
