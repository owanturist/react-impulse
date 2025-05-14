---
"react-impulse": minor
---

Added `ReadableImpulse` and `WritableImpulse` Interfaces.

```ts
interface ReadableImpulse<T> {
  getValue(scope: Scope): T
}

interface WritableImpulse<T> {
  setValue(value: T): void
}
```

These interfaces allow more flexible usage patterns and third-party integrations. The following APIs now accept anything that implements these interfaces, not just Impulse instances:

- ```dart
  function useScoped<TValue>(impulse: ReadableImpulse<TValue>): TValue
  ```
- ```dart
  Impulse<T>(
    getter: ReadonlyImpulse<T> | ((scope: Scope) => T),
    setter: WritableImpulse<T> | ((value: T, scope: Scope) => void),
    options?: ImpulseOptions<T>,
  ): Impulse<T>
  ```
- ```dart
  function untrack<TValue>(impulse: ReadableImpulse<TValue>): TValue
  ```

This change is backward compatible with all existing code while allowing for custom implementations of these interfaces.
