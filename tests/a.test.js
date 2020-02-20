import suite from "../lib/index";

export default suite(({ todo, skip }) => {
  todo("Write this test");
  skip("Skipping this test", () => {});
});
