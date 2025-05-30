---
"react-impulse-form": minor
---

**BREAKING CHANGES**

- Merge `ImpulseFormValue.of` fabric and `ImpulseFormValue` type into a single `ImpulseFormUnit` definition.
- Merge `ImpulseFormList.of` fabric and `ImpulseFormList` type into a single `ImpulseFormList` definition.
- Merge `ImpulseFormShape.of` fabric and `ImpulseFormShape` type into a single `ImpulseFormShape` definition.

#### Rationale

The changes were made to align the `react-impulse` API with the `react-impulse-form` API, which already has a single definition for `Impulse`.
