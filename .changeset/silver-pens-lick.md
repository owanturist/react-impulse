---
"react-impulse": patch
---

Replace `BaseImpulse#clone` return type from `DirectImpulse` to `Impulse`.

#### Rationale

The `DirectImpulse` does not add any additional functionality to `Impulse` when it extends `BaseImpulse`, so it is more appropriate to return the base type `Impulse` instead of the derived type `DirectImpulse`. This change improves type consistency and reduces confusion for users of the library.
