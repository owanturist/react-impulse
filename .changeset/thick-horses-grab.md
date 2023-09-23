---
"react-impulse": major
---

Drop the `compare` argument from `Impulse#setValue`.

Turns out that that in practice that argument is hardly ever used, but it makes the Impulse API confusing: why specifically `compare` is passed to `setValue` and not to `Impulse#of` or `useImpulse`?
So, when needed, define `compare` in [`Impulse.of(initialValue, compare)`](./#impulseof) fabric or [`useImpulse(initialValue, compare)`](./#useimpulse) hook.
