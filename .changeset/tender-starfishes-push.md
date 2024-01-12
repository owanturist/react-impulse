---
"react-impulse": minor
---

Introduce `Impulse.isImpulse` static method to check if a given object is an impulse.

```dart
Impulse.isImpulse<T, Unknown = unknown>(
  input: Unknown | Impulse<T>,
): input is Impulse<T>

Impulse.isImpulse<T, Unknown = unknown>(
  scope: Scope,
  check: (value: unknown) => value is T,
  input: Unknown | Impulse<T>,
): input is Impulse<T>
```
