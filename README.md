# @testingrequired/t

A minimal test framework

## Build

```bash
$ npm run build
```

## Usage

Create a test file `./tests/example.test.js`:

```javascript
import suite from "@testingrequired/t";

export default suite(({ test, beforeEach }) => {
  let value;

  beforeEach(() => {
    value = 10;
  });

  test("Testing", _ => {
    _.assertEqual(10, value);
  });

  test.skip("Test will skip", _ => {
    _.assertEqual(10, value);
  });

  test.todo("Write this test");
});
```

## Running

```bash
$ node -r esm ./lib/runner.js ./tests/example.test.js ...
```
