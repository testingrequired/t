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

export default Suite.new
  .test("This test will pass", _ => _.assert(true))
  .todo("Write this test")
  .skip("Skipping this test", () => {});
```

## Running

```bash
$ node -r esm ./lib/runner.js ./tests/*.test.js
```
