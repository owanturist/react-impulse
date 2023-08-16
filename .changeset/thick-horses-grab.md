---
"react-impulse": major
---

Drop the `compare` argument from `Impulse#setValue`.

Turns that that on practice that argument is hardly ever used, but it makes the Impulse API more complicated than it needs to be.
Instead, the compare function might be defined in the `Impulse.of(initialValue, compare)` fabric or `useImpulse(initialValue, compare)` hook.
