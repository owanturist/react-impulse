---
"react-impulse": major
---

Introduce [`ImpulseOptions`](./#impulseoptions) and [`UseScopedOptions`](./useScopedoptions) as a replacement for raw `compare` argument:

```ts
// before
const impulse_1 = Impulse.of({ count: 0 }, shallowEqual)
const impulse_2 = impulse_1.clone((x) => x, shallowEqual)
const impulse_3 = useImpulse({ count: 0 }, shallowEqual)
const value = useWatchImpulse(() => impulse_2.getValue(), shallowEqual)

// now
const impulse_1 = Impulse.of({ count: 0 }, { compare: shallowEqual })
const impulse_2 = impulse_1.clone((x) => x, { compare: shallowEqual })
const impulse_3 = useImpulse({ count: 0 }, { compare: shallowEqual })
const value = useScoped(() => impulse_2.getValue(), {
  compare: shallowEqual,
})
```

The overall functionality is the same, but now it opens up a possibility to add more options in the future and helps TypeScript to distinguish options from other arguments (it was a problem with `compare` and other function arguments).
