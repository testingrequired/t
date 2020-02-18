const { Suite } = require("../lib/index");

module.exports = Suite.init(s => {
  s.test("Testing", _ => {
    _.assert(true);
  });
});
