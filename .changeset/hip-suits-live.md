---
"react-impulse": major
---

**BREAKING CHANGE**

The `Impulse#getValue` no longer supports the selector function as a second parameter. This change simplifies the API and makes behavior more predictable.

#### Migration Guide

```ts
// Before
const count = Impulse.of(0)
const doubled = count.getValue(scope, (value) => value * 2)

// After
const count = Impulse.of(0)
const doubled = count.getValue(scope) * 2
```

Apply transformations directly to the returned value instead of passing a selector function.
