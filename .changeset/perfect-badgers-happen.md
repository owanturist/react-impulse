---
"react-impulse": major
---

Introduce the `untrack` function.

```dart
function untrack<TResult>(factory: (scope: Scope) => TResult): TResult
function untrack<TValue>(impulse: ReadonlyImpulse<TValue>): TValue
```

The `untrack` function is a helper to read Impulses' values without reactivity. It provides a [`Scope`][scope] to the `factory` function and returns the result of the function. Acts as [`batch`][batch].
