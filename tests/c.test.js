const { Suite } = require("../lib/index");

module.exports = Suite.init(s => {
  let value;
  s.beforeEach(() => {
    value = 10;
  }).test("Testing", _ => {
    _.assertEqual(10, value);
  });
});
