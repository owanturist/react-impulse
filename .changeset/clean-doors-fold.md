---
"react-impulse": minor
---

Extend `Impulse(getter, options?)` by allowing `getter` to be a `ReadableImpulse<T>`:

```dart
Impulse<T>(
  getter: ReadableImpulse<T> | ((scope: Scope) => T),
  options?: ImpulseOptions<T>,
): ReadonlyImpulse<T>
```

Resolves [#895](https://github.com/owanturist/react-impulse/issues/895)
