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
- **API consolidation**: Single `useMonitor` hook reduces cognitive load
- **Functional flexibility**: Both `signal.read(monitor)` and `monitor(signal)` work
- **Better discoverability**: Hook names like `useMonitorEffect` are self-explanatory

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

// Proposed (consolidated, two equivalent ways)
const monitor = useMonitor()
const value1 = useMonitor((monitor) => signal.read(monitor)) // Pass monitor to signal
const value2 = useMonitor((monitor) => monitor(signal)) // Pass signal to monitor
```

#### Complete hook family

```ts
// Current
useScopedCallback → useMonitorCallback
useScopedEffect → useMonitorEffect
useScopedLayoutEffect → useMonitorLayoutEffect
useScopedMemo → useMonitorMemo
```

### Trade-offs

- **Breaking change**: Complete API rename requires migration
- **Ecosystem disruption**: Existing codebases need updates
- **Learning curve**: Developers familiar with current names need to adapt

However, these costs are justified by significantly improved long-term developer experience and ecosystem alignment.

### Implementation approach

1. **Core rename**: `Impulse` → `Signal`, `Scope` → `Monitor`
2. **Method rename**: `getValue(scope)` → `read(monitor)`
3. **Hook consolidation**: Merge `useScope` + `useScoped` → `useMonitor`
4. **Hook family rename**: `useScoped*` → `useMonitor*`
5. **Migration path**: Provide codemods and migration guides

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

### Consolidated useMonitor hook

```ts
// Create monitor
function useMonitor(): Monitor

// Reactive computation
function useMonitor<T>(
  computation: (monitor: Monitor) => T,
  deps?: React.DependencyList,
  options?: UseMonitoredOptions<T>,
): T
```

### Monitor hook family

```ts
function useMonitorCallback<T extends (...args: any[]) => any>(
  callback: (monitor: Monitor) => T,
  deps: React.DependencyList,
): T

function useMonitorEffect(
  effect: (monitor: Monitor) => void | (() => void),
  deps?: React.DependencyList,
): void

function useMonitorLayoutEffect(
  effect: (monitor: Monitor) => void | (() => void),
  deps?: React.DependencyList,
): void

function useMonitorMemo<T>(
  factory: (monitor: Monitor) => T,
  deps: React.DependencyList,
): T
```

### Example usage

```tsx
import { Signal, useMonitor, useMonitorEffect } from "react-impulse"

const count = Signal(0)
const doubled = Signal(0)

function Counter() {
  // Both of these are equivalent:
  const countValue = useMonitor((monitor) => count.read(monitor)) // Method style
  const doubledValue = useMonitor((monitor) => monitor(doubled)) // Function style

  // Reactive effect (can use either style)
  useMonitorEffect(
    (monitor) => {
      const value = monitor(count) // Using function style
      doubled.update(value * 2)
    },
    [count],
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
