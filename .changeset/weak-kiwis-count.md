---
"react-impulse": major
---

Extend `Impulse.of` to accept an init function similar to `useImpulse` signature:

```dart
of<T>(
  valueOrInitValue: T | ((scope: Scope) => T),
  options?: ImpulseOptions<T>,
): Impulse<T>
```

- `[valueOrInitValue]` is an optional value used during the initial render. If the initial value infers from another Impulse, you may provide a function instead, which will be executed only during initialization. If not defined, the Impulse's value is `undefined` but it still can specify the value's type.
- `[initialValue]` is an optional initial value. If not defined, the Impulse's value is `undefined` but it still can specify the value's type.
- `[options]` is an optional [`ImpulseOptions`][impulse_options] object.
  - `[options.compare]` when not defined or `null` then [`Object.is`][object_is] applies as a fallback.

The **BREAKING CHANGE** is that all Impulses that store a function as a value, should wrap the initialization function with `Impulse.of` to avoid the function being executed during the initial render. Here is the migration guide:

```ts
// Before
const sorting = Impulse.of((left: number, right: number) => left - right)

// After
const sorting = Impulse.of(() => {
  return (left: number, right: number) => left - right
})
```
