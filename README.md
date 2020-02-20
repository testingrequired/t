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

## Configuration

An optional configuration file `.trc` can be created:

```typescript
{
  pattern?: string; // Test file glob pattern. Default: tests/**/*.test.js
}
```

## Running

```bash
$ node -r esm ./lib/runner.js
```

You can also override the configured test file pattern:

```bash
$ node -r esm ./lib/runner.js src/**/*.spec.js
```
