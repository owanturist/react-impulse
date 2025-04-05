---
"react-impulse": minor
---

Added `ImpulseGetter` and `ImpulseSetter` Interfaces.

```ts
interface ImpulseGetter<T> {
  getValue(scope: Scope): T
}

interface ImpulseSetter<T> {
  setValue(value: T): void
}
```

These interfaces allow more flexible usage patterns and third-party integrations. The following APIs now accept anything that implements these interfaces, not just Impulse instances:

- ```dart
  function useScoped<TValue>(impulse: ImpulseGetter<TValue>): TValue
  ```
- ```dart
  Impulse.of<T>(
    getter: ReadonlyImpulse<T> | ((scope: Scope) => T),
    setter: ImpulseSetter<T> | ((value: T, scope: Scope) => void),
    options?: ImpulseOptions<T>,
  ): Impulse<T>
  ```
- ```dart
  function untrack<TValue>(impulse: ImpulseGetter<TValue>): TValue
  ```

This change is backward compatible with all existing code while allowing for custom implementations of these interfaces.
