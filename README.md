# @testingrequired/t

A minimal test framework

## Build

```bash
$ npm run build
```

## Usage

Create a test file `./tests/example.test.js`. Test files are modules that export a suite:

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

The following functions are available in the `suite` callback: `beforeEach`, `afterEach`, `beforeAll`, `afterAll`, `test`, `skip`, `todo`

## Running

A glob pattern to identify test files is passed as the runners only argument:

```bash
$ node -r esm ./lib/runner.js ./tests/*.test.js
```

## Config

A `.trc` configuration file can be created and will override any command line configuration.

```javascript
{
  "pattern": "./tests/*.test.js"
}
```
