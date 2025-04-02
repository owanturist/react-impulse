---
"react-impulse": patch
---

Removed the internal `TransmittingImpulse._replaceGetter` and `Impulse._emit` methods, which was previously used for internal implementation details of transmitting impulses.

This removal has no impact on the public API or existing usage of `Impulse.transmit()`.
