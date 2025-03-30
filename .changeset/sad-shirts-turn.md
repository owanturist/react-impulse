---
"react-impulse": minor
---

Introduce `ImpulseGetter` interface:

```ts
interface ImpulseGetter<T> {
  getValue(scope: Scope): T
}
```

The following API has been adjusted to handle anything that implements the `ImpulseGetter` rather than `Impulse`/`ReadonlyImpulse`:

- ```dart
  function useScoped<TValue>(impulse: ImpulseGetter<TValue>): TValue
  ```

- ```dart
  Impulse.transmit<T>(
    getter: ReadonlyImpulse<T> | ((scope: Scope) => T),
    setter: Impulse<T> | ((value: T, scope: Scope) => void),
    options?: TransmittingImpulseOptions<T>,
  ): Impulse<T>
  ```

- ```dart
  function untrack<TValue>(impulse: ImpulseGetter<TValue>): TValue
  ```
