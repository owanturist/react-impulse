---
"react-impulse-form": minor
---

**BREAKING CHANGES**

A custom error generic for `ImpulseFormValue<TInput, TError = null, TOutput = TInput>` has been introduced. The `ImpulseForm#setErrors` and `ImpulseForm#getErrors` methods were renamed to `ImpulseForm#setError` and `ImpulseForm#getError`, respectively.

#### Rationale

This change was made to provide a more flexible and type-safe way to handle errors in the `ImpulseFormValue` class. By allowing users to specify a custom error type, we can better accommodate different use cases and improve the overall usability of the library.

#### Migration Guide

1. Specify the `TError` as `ReadonlyArray<string>` when creating an `ImpulseFormValue` with `schema`:

   ```ts
   const form: ImpulseFormValue<
     string,
     ReadonlyArray<string>
   > = ImpulseFormValue.of("", { schema: z.string() })
   ```

2. Specify custom error type when creating an `ImpulseFormValue` with `validate`:

   ```ts
   const form: ImpulseFormValue<string, string> = ImpulseFormValue.of("", {
     validate: (value) => {
       return value.length > 0 ? [null, value] : ["Value is required", null]
     },
   })
   ```
