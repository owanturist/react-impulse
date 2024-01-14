---
"react-impulse": patch
---

The `TransmittingImpulse#setValue` method always emits changes to enforce the transmitting value update for cases when the value is not reactive (ex. `localStorage`, global values, etc). Resolves #627.
