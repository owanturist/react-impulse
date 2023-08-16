---
"react-impulse": major
---

Make the `Impulse#compare` property private.

Turns that that on practice that property is hardly ever used, so now and it becomes private.
But you still can specify `Impulse#compare` via `Impulse.of(initialValue, compare)` fabric or `useImpulse(initialValue, compare)` hook.
