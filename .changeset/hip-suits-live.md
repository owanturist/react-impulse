---
"react-impulse": major
---

**BREAKING CHANGES**

The `Impulse#getValue` no longer supports the selector function as a second parameter. This change simplifies the API and makes behavior more predictable by ensuring that value transformations are explicit in your code rather than hidden in selector callbacks, which leads to more readable and maintainable code.

#### Rationale

Simplifying `getValue` to have a single responsibility—retrieving the current value without transformation—makes the library more focused and easier to learn.

#### Migration Guide

```ts
// Before
const count = Impulse.of(0)
const doubled = count.getValue(scope, (value) => value * 2)

// After
const count = Impulse.of(0)
const doubled = count.getValue(scope) * 2
```

Apply transformations directly to the returned value instead of passing a selector function. This pattern works consistently across all code paths, including conditional logic and complex transformations.

#### Edge Cases

If you've been chaining multiple transformations in the selector function, you'll need to extract that logic:

```ts
// Before
const formatted = data.getValue(scope, (value) =>
  value ? formatValue(value).toUpperCase() : "N/A",
)

// After
const value = data.getValue(scope)
const formatted = value ? formatValue(value).toUpperCase() : "N/A"
```
