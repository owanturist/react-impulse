---
"react-impulse-form": minor
---

Introduce `ImpulseFormValueOptions.isInputDirty` option:
A compare function that determines whether the input is dirty. When it is, the `ImpulseFormValue#isDirty` returns `true`. Fallbacks to `not(isInputEqual)` if not provided.

Useful for values that have intermediate states deviating from the initial value, but should not be considered dirty such as strings, unsorted arrays, etc. Intended to tune business logic and avoid false positives for dirty states.

```ts
const form = ImpulseFormValue.of("", {
  isInputDirty: (left, right) => left.trim() !== right.trim(),
})

form.setInput(" ")
form.isDirty(scope) === false
```

---

Deletes `ImpulseFormValue#setCompare` option.
