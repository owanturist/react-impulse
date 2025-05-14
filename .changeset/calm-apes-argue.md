---
"react-impulse": major
---

**BREAKING CHANGES**

The `Impulse.transmit` method has been merged into the `Impulse` function. The `TransmittingImpulseOptions` type has been removed.

#### Rationale

This change simplifies the API by consolidating related functionality into a single method, making the library more intuitive with fewer entry points to learn. It also aligns with established reactive programming patterns by using the widely recognized "derived" terminology instead of "transmit".

#### Functional Equivalence

This change is purely syntactic - all functionality previously available with `Impulse.transmit` remains fully supported through `Impulse` with identical behavior. Your derived impulses will continue to work exactly as before with the new API.

#### Migration Guide

- For `Impulse.transmit(getter, [setter])`, replace with `Impulse(getter, [setter])`:

  ```ts
  const source = Impulse(1)

  // Before
  const derived = Impulse.transmit(
    (scope) => ({ count: source.getValue(scope) }),
    (next) => source.setValue(next.count),
  )

  // After
  const derived = Impulse(
    (scope) => ({ count: source.getValue(scope) }),
    (next) => source.setValue(next.count),
  )
  ```

- For `Impulse(Function, [options])`, wrap the `Function` in an object:

  ```ts
  // Before
  const sorting = Impulse((left: number, right: number) => left - right)

  // After
  const sorting = Impulse({
    fn: (scope) => (left: number, right: number) => left - right,
  })
  ```

- For `TransmittingImpulseOptions` replace with `ImpulseOptions`.
