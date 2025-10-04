---
title: Derived Computations
description: Explain how reactive computations work, including memory management and efficiency considerations
---

Derived computations in react-impulse allow you to create reactive values that automatically update when their source impulses change. Think of them as "computed properties" that maintain themselves - they cache their results for efficiency but automatically recalculate when any of their inputs change.

A derived impulse looks and behaves just like a regular impulse from the outside, but internally it manages a reactive computation rather than storing a directly-assigned value.

## Mental model

### The Smart Calculator Metaphor

Imagine a derived impulse as a smart calculator that:

- **Remembers its formula**: It knows how to compute its value from other impulses
- **Tracks its inputs**: It automatically notices when any input value changes
- **Caches results**: It doesn't recalculate unless something actually changed
- **Stays synchronized**: It updates immediately when dependencies change

```typescript
// Like a spreadsheet cell that references other cells
const firstName = Impulse("John")
const lastName = Impulse("Doe")

// This "cell" automatically updates when firstName or lastName change
const fullName = Impulse(
  (scope) => `${firstName.getValue(scope)} ${lastName.getValue(scope)}`,
)
```

### Lazy Evaluation

Derived impulses only compute their value when someone actually reads it, and only when their dependencies have changed since the last computation. This lazy approach prevents unnecessary work:

```typescript
const expensiveComputation = Impulse((scope) => {
  const data = sourceData.getValue(scope)
  console.log("Computing...") // Only logs when sourceData actually changes
  return performExpensiveCalculation(data)
})

// First read triggers computation
const result1 = expensiveComputation.getValue(scope) // "Computing..." logged

// Second read uses cached value (assuming sourceData unchanged)
const result2 = expensiveComputation.getValue(scope) // Nothing logged

// Changing source triggers recomputation on next read
sourceData.setValue(newData)
const result3 = expensiveComputation.getValue(scope) // "Computing..." logged again
```

## Key concepts

### API Symmetry

Derived impulses expose the same interface as regular impulses. This means you can use them interchangeably in most code - the consuming code doesn't need to know or care whether a value is stored directly or computed reactively.

```typescript
// These look identical from the outside
const storedValue = Impulse(42)
const computedValue = Impulse((scope) => otherValue.getValue(scope) * 2)

// Both can be read the same way
const a = storedValue.getValue(scope)
const b = computedValue.getValue(scope)

// Both can be passed to functions expecting impulses
function displayValue(impulse: ReadableImpulse<number>) {
  return impulse.getValue(scope).toString()
}
```

### Writable Derived Impulses

Derived impulses can also be made writable by providing a setter function, creating a two-way reactive binding:

```typescript
const celsius = Impulse(0)

const fahrenheit = Impulse(
  // Getter: celsius to fahrenheit
  (scope) => (celsius.getValue(scope) * 9) / 5 + 32,
  // Setter: fahrenheit to celsius
  (f) => celsius.setValue(((f - 32) * 5) / 9),
)

celsius.setValue(100)
console.log(fahrenheit.getValue(scope)) // 212

fahrenheit.setValue(32)
console.log(celsius.getValue(scope)) // 0
```

### Dependency Chain Propagation

Derived impulses can depend on other derived impulses, creating reactive chains that propagate changes efficiently:

```typescript
const radius = Impulse(5)
const area = Impulse((scope) => Math.PI * Math.pow(radius.getValue(scope), 2))
const circumference = Impulse((scope) => 2 * Math.PI * radius.getValue(scope))

// This depends on TWO other derived impulses
const summary = Impulse((scope) => ({
  radius: radius.getValue(scope),
  area: area.getValue(scope),
  circumference: circumference.getValue(scope),
}))

// Changing radius updates all three derived values
radius.setValue(10) // summary, area, and circumference all update
```

### Memory Safety and Cleanup

One of the most important aspects of derived impulses is their memory management. Since they create internal scopes to track dependencies, special care is needed to prevent memory leaks.

#### The WeakRef Solution

Derived impulses use `WeakRef` internally to ensure that when they become unreachable, their internal dependency tracking can be garbage collected:

```typescript
let derived = Impulse((scope) => source.getValue(scope) * 2)

// The source now has a weak reference to derived's internal scope
console.log(source._emitters.size) // 1

// When derived becomes unreachable...
derived = null

// The garbage collector can eventually clean up the internal scope
// (The exact timing depends on GC, but it will happen)
await eventually(() => {
  expect(source._emitters.size).toBe(0)
})
```

This is crucial because derived impulses don't expose a manual `.destroy()` method - cleanup happens automatically through garbage collection.

### Clone Behavior

When you clone a derived impulse, you get a regular (non-derived) impulse containing the current computed value:

```typescript
const source = Impulse(10)
const derived = Impulse((scope) => source.getValue(scope) * 2)
const cloned = derived.clone()

console.log(derived.getValue(scope)) // 20
console.log(cloned.getValue(scope)) // 20

// Changing source affects derived but not the clone
source.setValue(15)
console.log(derived.getValue(scope)) // 30
console.log(cloned.getValue(scope)) // 20 (unchanged)
```

This behavior is useful for "snapshotting" a computed value at a particular moment.

## Trade-offs

### Benefits

**Automatic Synchronization**: Derived values stay in sync with their sources automatically, eliminating manual update logic.

**Efficient Caching**: Values are only recomputed when dependencies actually change, not on every access.

**Composable**: Derived impulses can depend on other derived impulses, enabling complex reactive networks.

**API Consistency**: They work exactly like regular impulses, making them easy to integrate into existing code.

### Considerations

**Memory Management Complexity**: The WeakRef-based cleanup means you need to understand JavaScript garbage collection behavior for optimal memory usage.

**Debugging Challenges**: Dependency chains can become complex, making it harder to trace why a particular recomputation occurred.

**Internal Scope Overhead**: Each derived impulse creates its own internal scope for dependency tracking, adding slight memory overhead.

**No Explicit Cleanup**: Unlike scopes created by scope factories, derived impulses don't provide manual cleanup methods - you must rely on garbage collection.
