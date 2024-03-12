---
"react-impulse-form": minor
---

Breaking change:

- Rename `ImpulseFormValueOptions.compare` to `ImpulseFormValueOptions.isOriginalValueEqual`
- `ImpulseFormValue#setOriginalValue` does not reset errors on call anymore. Call `ImpulseFormValue#setErrors([])` manually when needed.
