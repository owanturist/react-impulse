---
"react-impulse-form": patch
---

Fixes:

- `ImpulseForm#isValid` returns true only when `ImpulseForm#isValidated` is true.
- `ImpulseFormValue#reset` sets `ImpulseFormValue#isTouched` to false.
