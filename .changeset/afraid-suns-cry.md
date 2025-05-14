---
"react-impulse": major
---

**BREAKING CHANGES**

- The `Impulse.of` static method was removed and replaced with the `Impulse` function providing the same signature. Combined with the `Impulse` type, this is now the sole API for defining types and creating impulses. For example:

  ```ts
  import { Impulse } from "react-impulse"

  const count: Impulse<number> = Impulse(0)
  ```

- The `Impulse.isImpulse` static method was removed and replaced with the `isImpulse` function providing the same signature.

- The `ImpulseGetter` was renamed to `ReadableImpulse`.

- The `ImpulseSetter` was renamed to `WritableImpulse`.

#### Migration Guide

- Replace `Impulse.of()` calls with `Impulse()`:

  - **Creating an impulse without an initial value**:

    ```ts
    // Before
    const empty = Impulse.of()

    // After
    const empty = Impulse()
    ```

  - **Creating an impulse with an initial value**:

    ```ts
    // Before
    const count = Impulse.of(0)

    // After
    const count = Impulse(0)
    ```

  - **Creating a derived impulse**:

    ```ts
    // Before
    const writable = Impulse.of(
      (scope) => count.getValue(scope),
      (value, scope) => count.setValue(value, scope),
    )

    // After
    const writable = Impulse(
      (scope) => count.getValue(scope),
      (value, scope) => count.setValue(value, scope),
    )
    ```

- Replace `Impulse.isImpulse` calls with `isImpulse`:

  ```ts
  // Before
  if (Impulse.isImpulse(something)) {
    // ...
  }

  // After
  import { isImpulse } from "react-impulse"

  if (isImpulse(something)) {
    // ...
  }
  ```

- Update imports to use `ReadableImpulse` and `WritableImpulse` instead of `ImpulseGetter` and `ImpulseSetter`:

  ```ts
  // Before
  import type { ImpulseGetter, ImpulseSetter } from "react-impulse"

  // After
  import type { ReadableImpulse, WritableImpulse } from "react-impulse"
  ```
