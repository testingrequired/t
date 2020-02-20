import suite from "../lib/index";
import createSpy from "../lib/spy";

export default suite(({ test }) => {
  test("spy works", _ => {
    const s = createSpy();

    s("foo");

    _.assertEqual(1, s.calls.length);
    _.assertEqual(1, s.calls[0].length);
    _.assert(s.calls[0].includes("foo"));
  });

  test("spy clear works", _ => {
    const s = createSpy();

    s("foo");

    s.clear();

    _.assertEqual(0, s.calls.length);
  });
});
