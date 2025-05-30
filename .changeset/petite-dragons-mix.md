---
"react-impulse-form": minor
---

**BREAKING CHANGES**

The `ImpulseFormUnit#getOutput` returns the output value even when the unit is **not validated**. It used to return `[null, null]` in such cases.
