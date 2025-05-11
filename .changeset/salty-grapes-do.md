---
"react-impulse": patch
---

Improved memory management and performance by introducing `WeakRef` for better garbage collection. Additionally, derived impulses now maintain an internal state and only update it when a dependency value changes. This ensures that calling `getValue(scope)` returns the same value unless a dependency of the derived impulse changes.

#### Code Example

Before:

```ts
const source = Impulse.of(0)
const derived = Impulse.of((scope) => ({
  count: source.getValue(scope),
}))

const value1 = derived.getValue(scope) // { count: 0 }
const value2 = derived.getValue(scope) // { count: 0 }
console.log(value1 === value2) // false

source.setValue(scope, 1)
const value3 = derived.getValue(scope) // { count: 1 }

console.log(value2 === value3) // false
```

After:

```ts
const source = Impulse.of(0)
const derived = Impulse.of((scope) => ({
  count: source.getValue(scope),
}))

const value1 = derived.getValue(scope) // { count: 0 }
const value2 = derived.getValue(scope) // { count: 0 }
console.log(value1 === value2) // true

source.setValue(scope, 1)
const value3 = derived.getValue(scope) // { count: 1 }
console.log(value2 === value3) // false
```
