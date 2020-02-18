# @testingrequired/t

A minimal test framework

## Running

```bash
$ npm run build
$ node -r esm ./lib/runner.js ./tests/*.test.js
```

## Usage

```javascript
import Suite from "@testingrequired/t";

export default Suite.new
  .todo("Write this test")
  .skip("Skipping this test", () => {});
```
