---
"react-impulse": major
---

Introduce `ImpulseGetter` and `ImpulseSetter` interfaces:

```ts
interface ImpulseGetter<T> {
  getValue(scope: Scope): T
}

interface ImpulseSetter<T> {
  setValue(value: T): void
}
```

The following API has been adjusted to handle anything that implements the `ImpulseGetter`/`ImpulseSetter` rather than `Impulse` OR `ReadonlyImpulse`:

- ```dart
  function useScoped<TValue>(impulse: ImpulseGetter<TValue>): TValue
  ```

- ```dart
  Impulse.transmit<T>(
    getter: ReadonlyImpulse<T> | ((scope: Scope) => T),
    setter: ImpulseSetter<T> | ((value: T, scope: Scope) => void),
    options?: TransmittingImpulseOptions<T>,
  ): Impulse<T>
  ```

- ```dart
  function untrack<TValue>(impulse: ImpulseGetter<TValue>): TValue
  ```
