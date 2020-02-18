const { Suite } = require("../lib/index");

module.exports = Suite.init(s => {
  s.todo("Write this test").skip("Skipping this test", () => {});
});
