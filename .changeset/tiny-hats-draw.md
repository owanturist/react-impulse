---
"react-impulse": patch
---

Assign a compare function to a stable ref during the initial render so that Impulses created via `useImpulse` and `useTransmittingImpulse` can use `getValue()` and `setValue()` during initial render. Resolves #624.
