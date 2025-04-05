---
"react-impulse": patch
---

Removed the internal `DerivedImpulse._replaceGetter` and `Impulse._emit` methods, which was previously used for internal implementation details of derived impulses.

This removal has no impact on the public API or existing usage of `Impulse.of(getter, [setter])`.
