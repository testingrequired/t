# @testingrequired/t

A minimal test framework

## Build

```bash
$ npm run build
```

## Usage

Create a test file `./tests/example.test.js`:

```javascript
import Suite from "@testingrequired/t";

const expectedValue = Symbol();

let value;

export default Suite.new
  .beforeEach(() => {
    value = expectedValue;
  })
  .test("This test will pass", _ => _.assertEquals(expectedValue, value))
  .skip("Skipping this test", _ =>
    _.assert(false, "This assertion will never happen")
  )
  .todo("Need to write this test");
```

## Running

```bash
$ node -r esm ./lib/runner.js ./tests/*.test.js
```
