import Suite from "../lib/index";

export default Suite.new
  .todo("Write this test")
  .skip("Skipping this test", () => {});
