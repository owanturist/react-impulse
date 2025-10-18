---
title: Compare Function — what, how, and why
type: concept
packages:
  - react-impulse
relates-to:
  - impulse-concept
  - scope-concept
---

## Context and goals

Define the Compare function for custom equality checks in reactive systems.

### Goals

- Allow custom equality semantics for values in reactive containers.
- Enable performance optimizations by preventing unnecessary updates.
- Support different comparison strategies (shallow, deep, etc.).

### Non-goals

- Implement specific comparison algorithms.

## Design and rationale

### What is a Compare function

A Compare function is a predicate that takes two values and the **untracked** `Scope`, returning `true` if they are considered equal.

### Why it exists

- Default `Object.is` may not be suitable for complex objects or arrays and custom data structures.
- Custom compare allows fine-tuned control over when changes are considered significant.
- Performance: avoid unnecessary operations on equivalent values.

### How it works

A Compare function takes two values of type `T` and the **untracked** `Scope`, returning `true` if they are considered equal. This enables custom equality semantics, such as shallow or deep comparisons, beyond the default `Object.is`.

## API contract

```ts
type Compare<T> = (left: T, right: T, scope: Scope) => boolean
```

- **`left`** (`T`): The first value to compare.
- **`right`** (`T`): The second value to compare.
- **`scope`** (`Scope`): The **untracked** scope.

Returns `true` if the values are equal, `false` otherwise.

### Examples

```ts
const user = Impulse(
  {
    name: "Alice",
    age: 30,
  },
  {
    compare: (left, right) => {
      return left.name === right.name && left.age === right.age
    },
  },
)

const counters = Impulse([Impulse(1), Impulse(2)], {
  compare: (left, right, scope) => {
    if (left.length !== right.length) {
      return false
    }

    return left.every((element, index) => {
      return element.getValue(scope) === right[index].getValue(scope)
    })
  },
})
```
