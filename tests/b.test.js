import suite from "../lib/index";

export default suite(({ test }) => {
  test("Testing", _ => {
    _.assert(true);
  });
});
