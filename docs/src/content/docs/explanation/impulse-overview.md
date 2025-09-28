---
title: Understanding Impulses
description: Introduce the core concept of impulses - what they are, why they exist, and how they work
generated:
  from:
    - impulse-concept
  type: explanation
  date: 2025-09-24
  status: published
---

Impulses are the foundational building blocks of react-impulse, providing a minimal yet powerful abstraction for reactive state management. Think of an impulse as a smart container that not only holds a value but also knows when that value changes and can notify interested parties about those changes.

Unlike traditional state management solutions that rely on global stores or complex update mechanisms, impulses operate on a principle of **fine-grained reactivity**. Each impulse is its own tiny, independent store with precise notification semantics.

## Mental model

### The Smart Container Metaphor

Imagine an impulse as a smart box that:

- **Holds a value**: Like any container, it stores data
- **Watches for changes**: It knows when the contents actually change
- **Announces updates**: It tells only the interested parties when real changes occur
- **Tracks relationships**: It remembers who cares about its contents

### Precision Over Broadcasting

Traditional reactive systems often work like a megaphone in a crowded room - when anything changes, everyone hears about it and has to check if they care. Impulses work more like pagers - only the people who specifically subscribed to receive updates about a particular topic get notified when that topic changes.

```typescript
// Traditional approach: everything re-renders when anything changes
const [globalState, setGlobalState] = useState({
  user: {
    name: "Alice",
    age: 30,
  },
  ui: {
    darkMode: false,
  },
})

// Fine-grained approach: only components reading specific values re-render
const state = {
  user: {
    name: Impulse("Alice"),
    age: Impulse(30),
  },
  ui: {
    darkMode: Impulse(false),
  },
}
```

## Key concepts

### Explicit Scope Passing

Every read operation requires a `Scope` parameter. This explicit approach prevents subtle bugs where reactive tracking might silently fail, while also making the reactive nature of code visible at the call site.

```typescript
const state = {
  user: {
    name: Impulse("Alice"),
  },
}

// Clear that this read establishes a dependency
const userName = state.user.name.getValue(scope)

// TypeScript prevents forgetting the scope
// state.user.name.getValue() // ❌ Compile error
```

### Compare-Based Updates

Impulses don't just notify on every write operation - they use comparison semantics to determine if a change is "effective." This prevents unnecessary work when a value is set to the same thing it already was.

```typescript
const state = {
  counter: Impulse(5),
}

state.counter.setValue(5) // No notification - value didn't actually change
state.counter.setValue(6) // Notification sent - effective change occurred
```

### Immutable-Friendly Design

Impulses work best with immutable values, aligning perfectly with React's rendering model. The container itself is mutable (its internal state changes), but the values it contains should be treated as immutable.

```typescript
const state = {
  counter: Impulse(0),
  items: Impulse(["apple", "banana"]),
}

// Good: create new values immutably
state.counter.setValue((prev) => prev + 1)
state.items.setValue((prev) => [...prev, "orange"])

// Also good: immutable array operations
state.items.setValue((current) => current.filter((item) => item !== "apple"))
```

### Nestable and Composable

Impulses can contain other impulses, enabling fine-grained reactivity at multiple levels. This allows you to compose complex state structures while maintaining precise update boundaries.

```typescript
const cart = Impulse([
  { id: 1, count: Impulse(2) },
  { id: 3, count: Impulse(1) },
])

// Updating individual item counts doesn't affect other cart items
// Only components reading that specific item's count will re-render
cart.getValue(scope).at(0)?.count.setValue(3)
```

## Trade-offs

### Benefits

- **Precision**: Only consumers that read specific values get notified when those values change. No unnecessary updates from irrelevant changes.
- **Predictability**: Dependency tracking is automatic and accurate. No manual dependency arrays that can become stale.
- **Composability**: Impulses can be combined, nested, and derived from each other to build complex reactive systems.
- **Performance**: Fine-grained updates and built-in batching minimize unnecessary work.

### Considerations

- **Learning curve**: The explicit scope passing and reactive mental model requires some adjustment from traditional React patterns.
- **Overhead per dependency**: Each impulse carries its own subscription management, which adds slight overhead compared to monolithic stores (though this is usually negligible).
- **Framework integration**: While the core is framework-agnostic, you'll typically use it through React hooks that bridge between impulse semantics and React's update model.
