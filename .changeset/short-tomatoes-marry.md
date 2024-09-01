---
"react-impulse-form": minor
---

Rename all entries of `value` to `output` and `originalValue` to `input`:

1. `ImpulseForm`:
   1. `ImpulseFormParams['value.schema']` -> `ImpulseFormParams['output.schema']`
   2. `ImpulseFormParams['value.schema.verbose']` -> `ImpulseFormParams['output.schema.verbose']`
   3. `ImpulseFormParams['originalValue.schema']` -> `ImpulseFormParams['input.schema']`
   4. `ImpulseFormParams['originalValue.setter']` -> `ImpulseFormParams['input.setter']`
   5. `ImpulseForm#getValue` -> `ImpulseFormParams#getOutput`
   6. `ImpulseForm#getOriginalValue` -> `ImpulseFormParams#getInput`
   7. `ImpulseForm#setOriginalValue` -> `ImpulseFormParams#setInput`
   8. `ImpulseForm#setInitialValue` -> `ImpulseFormParams#setInitialInput`
2. `ImpulseFormList`:
   1. `ImpulseFormListOptions.initialValue` -> `ImpulseFormListOptions.initialInput`
   2. `ImpulseFormListOptions.originalValue` -> `ImpulseFormListOptions.input`
3. `ImpulseFormShape`:
   1. `ImpulseFormShapeOptions.initialValue` -> `ImpulseFormShapeOptions.initialInput`
   2. `ImpulseFormShapeOptions.originalValue` -> `ImpulseFormShapeOptions.input`
4. `ImpulseFormValue`:
   1. `ImpulseFormValue<TOriginalValue, TValue>` -> `ImpulseFormValue<TInput, TOutput>`
   2. `ImpulseFormValueOptions.isOriginalValueEqual` -> `ImpulseFormValueOptions.isInputEqual`
   3. `ImpulseFormValueOptions.initialValue` -> `ImpulseFormValueOptions.initialInput`
