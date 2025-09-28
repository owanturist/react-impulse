---
title: Impulse API Reference
description: Complete API reference for creating, reading, and writing impulse values
generated:
  from:
    - impulse-concept
  type: reference
  date: 2025-09-24
  status: published
---

This reference covers the complete API for creating, reading, and writing impulse values. Impulses are reactive containers that notify dependents when their values effectively change, forming the core building blocks of the react-impulse reactivity system.

## API surface

### Factory Functions

#### `Impulse<T>()`

```typescript
function Impulse<T>(): Impulse<undefined | T>
```

Creates an impulse with an initial value of `undefined`.

**Example:**

```typescript
const optional = Impulse<string>()
console.log(optional.getValue(scope)) // undefined
```

#### `Impulse<T>(initialValue, options?)`

```typescript
function Impulse<T>(initialValue: T, options?: ImpulseOptions<T>): Impulse<T>
```

Creates an impulse with the specified initial value and optional configuration.

**Parameters:**

- `initialValue: T` - The initial value to store
- `options?: ImpulseOptions<T>` - Optional configuration object

**Example:**

```typescript
const counter = Impulse(0)
const name = Impulse("Alice", { compare: null }) // Force default comparison
```

#### `Impulse<T>(getter, options?)`

```typescript
function Impulse<T>(
  getter: ReadableImpulse<T> | ((scope: Scope) => T),
  options?: ImpulseOptions<T>,
): ReadonlyImpulse<T>
```

Creates a read-only derived impulse that computes its value from other impulses.

**Parameters:**

- `getter: ReadableImpulse<T> | ((scope: Scope) => T)` - Function or readable impulse to derive value from
- `options?: ImpulseOptions<T>` - Optional configuration object

**Example:**

```typescript
const firstName = Impulse("John")
const lastName = Impulse("Doe")
const fullName = Impulse(
  (scope) => `${firstName.getValue(scope)} ${lastName.getValue(scope)}`,
)
```

#### `Impulse<T>(getter, setter, options?)`

```typescript
function Impulse<T>(
  getter: ReadableImpulse<T> | ((scope: Scope) => T),
  setter: WritableImpulse<T> | ((value: T, scope: Scope) => void),
  options?: ImpulseOptions<T>,
): Impulse<T>
```

Creates a writable derived impulse with custom getter and setter logic.

**Parameters:**

- `getter: ReadableImpulse<T> | ((scope: Scope) => T)` - Function or readable impulse to derive value from
- `setter: WritableImpulse<T> | ((value: T, scope: Scope) => void)` - Function or writable impulse to handle writes
- `options?: ImpulseOptions<T>` - Optional configuration object

**Example:**

```typescript
const celsius = Impulse(0)
const fahrenheit = Impulse(
  (scope) => (celsius.getValue(scope) * 9) / 5 + 32,
  (f) => celsius.setValue(((f - 32) * 5) / 9),
)
```

### Instance Methods

#### `getValue(scope)`

```typescript
getValue(scope: Scope): T
```

Reads the current value of the impulse. When called with a tracking scope, establishes a dependency that will trigger re-execution when the value changes.

**Parameters:**

- `scope: Scope` - The scope for dependency tracking and lifecycle management

**Returns:** The current value of type `T`

**Example:**

```typescript
const count = Impulse(5)
const currentValue = count.getValue(scope) // 5
```

#### `setValue(nextValue)`

```typescript
setValue(nextValue: T): void
```

Sets the impulse to a new value. Notifications are sent only if the new value is different from the current value according to the comparison function.

**Parameters:**

- `nextValue: T` - The new value to store

**Example:**

```typescript
const count = Impulse(5)
count.setValue(10) // Triggers notifications
count.setValue(10) // No notification - same value
```

#### `setValue(transformer)`

```typescript
setValue(transformer: (current: T, scope: Scope) => T): void
```

Updates the impulse value using a transformer function that receives the current value and scope.

**Parameters:**

- `transformer: (current: T, scope: Scope) => T` - Function that computes the new value

**Example:**

```typescript
const count = Impulse(5)
count.setValue((current, scope) => current + 1) // Sets to 6
```

#### `clone(options?)`

```typescript
clone(options?: ImpulseOptions<T>): Impulse<T>
```

Creates a new impulse with the current value. For derived impulses, this creates a regular (non-derived) impulse containing the current computed value.

**Parameters:**

- `options?: ImpulseOptions<T>` - Optional configuration for the new impulse

**Returns:** New independent impulse with the current value

**Example:**

```typescript
const original = Impulse(42)
const copy = original.clone()
original.setValue(100)
console.log(copy.getValue(scope)) // Still 42
```

#### `clone(transformer, options?)`

```typescript
clone(
  transformer: (value: T, scope: Scope) => T,
  options?: ImpulseOptions<T>
): Impulse<T>
```

Creates a new impulse with a transformed version of the current value.

**Parameters:**

- `transformer: (value: T, scope: Scope) => T` - Function to transform the current value
- `options?: ImpulseOptions<T>` - Optional configuration for the new impulse

**Returns:** New independent impulse with the transformed value

**Example:**

```typescript
const count = Impulse(5)
const doubled = count.clone((value) => value * 2) // New impulse with value 10
```

### Configuration Options

#### `ImpulseOptions<T>`

```typescript
interface ImpulseOptions<T> {
  compare?: ((left: T, right: T, scope: Scope) => boolean) | null
}
```

Configuration object for impulse behavior.

**Properties:**

- `compare?: (left: T, right: T, scope: Scope) => boolean | null` - Custom comparison function to determine if values are equal. If not provided, uses `Object.is()`. Pass `null` to force default comparison even when cloning.

**Examples:**

```typescript
// Custom comparison for objects
const user = Impulse(userObj, {
  compare: (a, b) => a.id === b.id,
})

// Force default comparison when cloning
const copy = customImpulse.clone({ compare: null })

// Always trigger updates (rarely useful)
const alwaysUpdate = Impulse(value, {
  compare: () => false,
})
```

## Guarantees

### Comparison Semantics

- **Default Behavior**: Uses `Object.is()` for equality comparison
- **Change Detection**: `setValue()` only triggers notifications when the new value differs from current value
- **Custom Comparison**: The `compare` function determines "effective change"
- **Scope Access**: Comparison functions receive a scope parameter for reading other impulses if needed

### Memory Management

- **Stable Identity**: Impulse objects maintain stable identity throughout their lifetime
- **Mutable Container**: The impulse container is mutable, but stored values should be immutable
- **Garbage Collection**: Derived impulses use WeakRef for memory-safe dependency cleanup

### Notification Guarantees

- **Synchronous Comparison**: Value comparison happens synchronously during `setValue()`
- **Batched Notifications**: Multiple updates within a batch are coalesced into single notification cycles
- **Precise Dependencies**: Only scopes that previously read the impulse receive notifications

## Edge cases

### Comparison Function Edge Cases

```typescript
// Comparison function that reads other impulses
const impulse = Impulse(value, {
  compare: (a, b, scope) => {
    const threshold = thresholdImpulse.getValue(scope)
    return Math.abs(a - b) < threshold
  },
})
```

**Warning**: Comparison functions that read impulses can create complex dependency relationships. Use with caution.

### Mutable Value Considerations

```typescript
const arrayImpulse = Impulse([1, 2, 3])

// ❌ Problematic - mutates existing array
arrayImpulse.setValue((current) => {
  current.push(4)
  return current
})

// ✅ Recommended - creates new array
arrayImpulse.setValue((current) => [...current, 4])
```

**Best Practice**: Always use immutable updates to ensure predictable React rendering behavior.

### Clone Behavior with Custom Comparers

```typescript
const original = Impulse(value, { compare: customCompare })

// Carries over the custom comparer
const clone1 = original.clone()

// Forces default Object.is comparison
const clone2 = original.clone({ compare: null })

// Uses new custom comparer
const clone3 = original.clone({ compare: otherCompare })
```

### Transformer Function Scope Usage

```typescript
const impulse = Impulse(0)

impulse.setValue((current, scope) => {
  // Can read other impulses during transformation
  const multiplier = multiplierImpulse.getValue(scope)
  return current * multiplier
})
```

**Note**: Reading impulses within transformer functions creates dependencies during the write operation, which can lead to complex update chains.
