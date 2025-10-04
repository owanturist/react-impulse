---
title: Reactivity and Scope System
description: Explain the scope-based reactivity system and how dependency tracking works
---

The reactivity system in react-impulse is built around the concept of **Scopes** - objects that manage the lifecycle of reactive computations and automatically track dependencies. Unlike many reactive systems that use global scheduling or implicit dependency tracking, react-impulse uses explicit scope passing to ensure predictable, memory-safe reactivity.

Think of a scope as a "reactive context" that remembers what impulses were read during a computation, and can re-run that computation whenever any of those impulses change.

## Mental model

### The Dependency Tracking Detective

Imagine a scope as a detective that follows a computation around, taking notes:

- **During execution**: "I see you're reading the `user` impulse... _takes note_"
- **During execution**: "Now you're reading the `theme` impulse... _takes note_"
- **After execution**: "Got it - this computation depends on `user` and `theme`"
- **When changes occur**: "The `user` impulse changed - time to re-run!"

### Automatic vs Manual Subscription Management

Traditional reactive code often requires manual subscription management:

```typescript
// Traditional manual approach
useEffect(() => {
  const unsubscribe1 = user.subscribe(handleUserChange)
  const unsubscribe2 = theme.subscribe(handleThemeChange)
  return () => {
    unsubscribe1()
    unsubscribe2()
  }
}, []) // ⚠️ Easy to forget dependencies or cleanup
```

Scopes automate this entirely:

```typescript
// Scope-based approach - automatic tracking and cleanup
useScoped((scope) => {
  const currentUser = user.getValue(scope) // Automatically tracked
  const currentTheme = theme.getValue(scope) // Automatically tracked
  return computeSomething(currentUser, currentTheme)
})
```

### Fresh Start Every Time

A key insight is that scopes rebuild their dependency list on every run. This solves the "stale dependency" problem that plagues many reactive systems:

```typescript
useScoped((scope) => {
  const settings = userSettings.getValue(scope)

  if (settings.enableAdvanced) {
    // This read only happens conditionally...
    const advanced = advancedConfig.getValue(scope)
    return processAdvanced(advanced)
  }

  return processBasic(settings)
  // The scope automatically knows whether 'advancedConfig'
  // is a dependency based on the current execution path
})
```

## Key concepts

### Tracking vs Non-Tracking Scopes

Not all operations need reactivity. React-impulse provides both tracking and non-tracking scopes for different use cases:

**Tracking scopes** establish dependencies and re-run when those dependencies change:

- `useScope()` - Component-level reactive scope
- `useScoped()` - Reactive computation
- `subscribe()` - Framework-agnostic reactive listener

**Non-tracking scopes** read current values without establishing dependencies:

- `untrack()` - One-time value extraction
- `batch()` - Grouping updates without tracking
- `tap()` - Side effects without dependencies

```typescript
// This establishes a dependency - component re-renders when count changes
const count = useScoped(() => counter.getValue(scope))

// This doesn't establish a dependency - just gets current value
const handleClick = () => {
  untrack((scope) => {
    const current = counter.getValue(scope)
    console.log("Current count:", current) // No re-render setup
  })
}
```

### Explicit Scope Passing

Every impulse read requires an explicit scope parameter. This design choice prevents subtle bugs where reactive tracking might silently fail:

```typescript
// Clear and explicit - you know this read is reactive
const value = impulse.getValue(scope)

// TypeScript prevents accidental non-reactive reads
// impulse.getValue() // ❌ Compile error - scope required
```

This explicitness also makes it clear when code is operating in a reactive context vs when it's just accessing current values.

### Batching and Scheduling

The scope system includes sophisticated batching to prevent cascading updates:

```typescript
batch(() => {
  user.setValue({ ...user.getValue(scope), name: "Alice" })
  user.setValue({ ...user.getValue(scope), age: 30 })
  user.setValue({ ...user.getValue(scope), email: "alice@example.com" })
  // All three updates are batched into a single notification cycle
})
```

### Memory Safety with WeakRef

Scopes use `WeakRef` internally to prevent memory leaks. When a component unmounts or a computation is no longer needed, the associated scope can be garbage collected even if impulses still hold references to it.

This is particularly important for derived computations that might create long-lived dependency chains.

### Lifecycle Management

**React Integration**: React hooks automatically tie scope lifecycles to component lifecycles - scopes are created when components mount and cleaned up when they unmount.

**Manual Management**: In non-React code, `subscribe()` returns a cleanup function that must be called to prevent memory leaks.

**Automatic Cleanup**: The system automatically detaches scopes from impulses when they're no longer needed, preventing stale subscriptions.

## Trade-offs

### Benefits

**Automatic Accuracy**: Dependencies are tracked automatically based on actual reads, eliminating stale dependency bugs.

**Memory Safety**: WeakRef-based cleanup prevents memory leaks from abandoned reactive computations.

**Predictable Updates**: Clear separation between tracking and non-tracking operations makes update behavior predictable.

**Framework Agnostic Core**: The core reactivity system works in any JavaScript environment, with thin adapter layers for specific frameworks.

### Considerations

**Explicit Scope Passing**: Requires passing scope parameters, which can feel verbose compared to implicit reactive systems.

**Learning Curve**: The mental model of scopes and explicit tracking differs from other reactive libraries.

**TypeScript Dependency**: While not strictly required, the explicit scope passing provides most benefit when TypeScript prevents accidental omissions.
