---
"react-impulse": major
---

**BREAKING CHANGES**

- The `Impulse.of` static method was removed and replaced with the `Impulse` function providing the same signature.

- The `Impulse.isImpulse` static method was removed and replaced with the `isImpulse` function providing the same signature.

#### Rationale

The changes aim to simplify and modernize the API of `react-impulse` while improving its usability and consistency:

- **Removal of `Impulse.of`**: By replacing the static `Impulse.of` method with the `Impulse` function, the API becomes more intuitive. This change also reduces redundancy, as the `Impulse` function now serves as the sole entry point for creating impulses and defining types.

- **Standalone `isImpulse` function**: Moving `isImpulse` from a static method to a standalone function makes it possible to tree shake when unused.

These changes collectively enhance the developer experience, reduce cognitive load, and make the library easier to learn and use.

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
    // ..
  }

  // After
  import { isImpulse } from "react-impulse"

  if (isImpulse(something)) {
    // ..
  }
  ```
