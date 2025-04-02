---
"react-impulse": major
---

The `Impulse.of` signature has been extended to support initialization functions:

```dart
of<T>(
  valueOrInitValue: T | ((scope: Scope) => T),
  options?: ImpulseOptions<T>,
): Impulse<T>
```

This allows for dynamic initialization based on other Impulse values:

```ts
// Initialize based on another Impulse
const counter = Impulse.of(0)
const isPositive = Impulse.of((scope) => counter.getValue(scope) > 0)
```

**BREAKING CHANGE**: If you're storing functions as values in Impulses, you must now wrap them with an initialization function to prevent them from being executed during initialization:

```ts
// Before
const sorting = Impulse.of((left: number, right: number) => left - right)

// After
const sorting = Impulse.of(() => {
  return (left: number, right: number) => left - right
})
```

This change improves the API's consistency and provides a more intuitive way to initialize Impulses with values derived from other sources.
