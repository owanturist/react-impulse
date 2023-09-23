---
"react-impulse": major
---

Make the `Impulse#compare` property protected.

Turns out that that in practice that property is hardly ever used, so now and it becomes protected.
But you still can specify `Impulse#compare` via [`Impulse.of(initialValue, {compare})`](./#impulseof) fabric or [`useImpulse(initialValue, {compare})`](./#useimpulse) hook.
