import Suite from "./Suite";

export default function suite(fn: (s: Suite) => void): Suite {
  const suite = new Suite();

  fn.call(null, suite);

  return suite;
}
