---
title: Signal/Monitor API — renaming Impulse/Scope for clarity
type: concept
packages:
  - react-impulse
---

## Context and goals

The current `Impulse` and `Scope` naming in react-impulse, while functional, lacks intuitive clarity for developers. This concept explores renaming these core abstractions to `Signal` and `Monitor` to improve API discoverability and ecosystem alignment.

### Goals

- Improve API clarity and developer intuition through better naming
- Align with established reactive programming terminology
- Maintain all existing functionality while improving ergonomics
- Consolidate related hooks into a cleaner API surface

### Non-goals

- Change core functionality or behavior
- Break existing patterns unnecessarily
- Add new features beyond naming improvements

## Design and rationale

### Current naming issues

The existing `Impulse` and `Scope` names, while technically accurate, create confusion:

- **Impulse**: While technically correct (a sudden change in value), doesn't clearly convey "reactive value container"
- **Scope**: While accurate for dependency tracking context, doesn't clearly convey "reactive dependency tracker"
- **Hook fragmentation**: Separate `useScope` and `useScoped` hooks create API surface complexity

### Proposed renaming: Signal/Monitor

**Signal** - A reactive value container that broadcasts changes to interested parties
**Monitor** - A dependency tracking function that observes signal changes

This naming aligns with:

- Established reactive programming ecosystems (SolidJS, Preact Signals, Angular Signals)
- Clear mental model: signals broadcast, monitors observe
- Functional design: monitors are functions that can read signals
- Flexible API: Both `signal.read(monitor)` and `monitor(signal)` work

### Benefits

- **Ecosystem familiarity**: "Signal" is widely recognized in reactive programming
- **Clear semantics**: Broadcasting (Signal) vs observing (Monitor) is intuitive
- **API clarity**: `useMonitor()` handles imperative access while `useComputed*` covers derived values and effects
- **Functional flexibility**: Both `signal.read(monitor)` and `monitor(signal)` work
- **Better discoverability**: Hook names like `useComputedEffect` are self-explanatory

### API transformation

#### Core types

```ts
// Current
Impulse<T> → Signal<T>
Scope → Monitor

// Current
const impulse = Impulse(0)
const value = impulse.getValue(scope)

// Proposed (two equivalent ways)
const signal = Signal(0)
const value1 = signal.read(monitor)  // Pass monitor to signal
const value2 = monitor(signal)       // Pass signal to monitor
```

#### Hook consolidation

```ts
// Current (fragmented)
const scope = useScope()
const value = useScoped((scope) => impulse.getValue(scope))

// Proposed
const monitor = useMonitor()
const value = useComputed((monitor) => signal.read(monitor))
```

#### Complete hook family

```ts
// Current
useScopedCallback → useComputedCallback
useScopedEffect → useComputedEffect
useScopedLayoutEffect → useComputedLayoutEffect
useScopedMemo → useComputedMemo
```

#### Reactive utilities

```ts
// Current
const unsubscribe = subscribe((scope) => {
  console.log(impulse.getValue(scope))
  return () => console.log("Cleaning up")
})

// Proposed
const stop = effect((monitor) => {
  console.log(signal.read(monitor))
  return () => console.log("Cleaning up")
})
```

### Trade-offs

- **Breaking change**: Complete API rename requires migration
- **Ecosystem disruption**: Existing codebases need updates
- **Learning curve**: Developers familiar with current names need to adapt

However, these costs are justified by significantly improved long-term developer experience and ecosystem alignment.

### Implementation approach

1. **Core rename**: `Impulse` → `Signal`, `Scope` → `Monitor`
2. **Method rename**: `getValue(scope)` → `read(monitor)`
3. **Hook consolidation**: Split responsibilities into `useMonitor()` for imperative access and `useComputed()` for derived values
4. **Hook family rename**: `useScoped*` → `useComputed*`
5. **Effect rename**: `subscribe` → `effect`, aligning with reactive ecosystem terminology
6. **Migration path**: Provide codemods and migration guides

### Mental model alignment

**Signal** clearly represents:

- A value that changes over time
- Broadcasting changes to subscribers
- The "source" in reactive relationships

**Monitor** clearly represents:

- A dependency tracking context that observes signal changes
- Managing reactive lifecycles and subscriptions
- Providing both object-oriented and functional interfaces

This creates an intuitive producer/consumer relationship that's easy to understand and remember.

## API contract

### Signal (renamed from Impulse)

```ts
interface Signal<T> {
  read(monitor: Monitor): T
  update(value: T): void
  update(transform: (current: T, monitor: Monitor) => T): void
  clone(options?: SignalOptions<T>): Signal<T>
  clone(
    transform: (value: T, monitor: Monitor) => T,
    options?: SignalOptions<T>,
  ): Signal<T>
}

function Signal<T>(initialValue: T, options?: SignalOptions<T>): Signal<T>
function Signal<T>(): Signal<undefined | T>
```

### Monitor (renamed from Scope)

```ts
interface Monitor {
  <T>(signal: Signal<T>): T
  version?: number
}
```

A Monitor is a dependency tracking context that observes signal changes.

### useMonitor hook

```ts
function useMonitor(): Monitor
```

Returns a shared monitor instance tied to the component lifecycle for imperative reads and interop with imperative helpers.

### Computed React helpers

```ts
function useComputed<T>(
  compute: (monitor: Monitor) => T,
  deps?: React.DependencyList,
  options?: UseComputedOptions<T>,
): T

function useComputedMemo<T>(
  factory: (monitor: Monitor) => T,
  deps: React.DependencyList,
): T

function useComputedCallback<T extends (...args: any[]) => any>(
  factory: (monitor: Monitor) => T,
  deps: React.DependencyList,
): T

function useComputedEffect(
  effect: (monitor: Monitor) => void | (() => void),
  deps?: React.DependencyList,
): void

function useComputedLayoutEffect(
  effect: (monitor: Monitor) => void | (() => void),
  deps?: React.DependencyList,
): void
```

### Effect (renamed from subscribe)

```ts
function effect(listener: (monitor: Monitor) => Destructor): VoidFunction
```

Creates a reactive effect that re-runs the listener whenever any accessed signal changes and returns an unsubscribe function.

### Example usage

```tsx
import {
  Signal,
  useMonitor,
  useComputed,
  useComputedEffect,
} from "react-impulse"

const count = Signal(0)
const doubled = Signal(0)

function Counter() {
  const monitor = useMonitor()

  const countValue = useComputed((monitor) => count.read(monitor))
  const doubledValue = useComputed((monitor) => monitor(doubled))

  useComputedEffect(
    (monitor) => {
      const value = monitor(count) // Using function style
      doubled.update(value * 2)
    },
    [count, doubled],
  )

  return (
    <div>
      <p>Count: {countValue}</p>
      <p>Doubled: {doubledValue}</p>
      <button onClick={() => count.update((c) => c + 1)}>Increment</button>
    </div>
  )
}
```
