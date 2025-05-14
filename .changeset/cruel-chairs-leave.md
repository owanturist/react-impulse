---
"react-impulse": minor
---

Introduce the `isDerivedImpulse` function with the same signature as `isImpulse`:

```dart
isDerivedImpulse<T, Unknown = unknown>(
  input: Unknown | Impulse<T>,
): input is Impulse<T>

isDerivedImpulse<T, Unknown = unknown>(
  scope: Scope,
  check: (value: unknown) => value is T,
  input: Unknown | Impulse<T>,
): input is Impulse<T>
```

A function that checks whether the `input` is an `DerivedImpulse` instance. If the `check` function is provided, it checks the Impulse's value to match the `check` function.
