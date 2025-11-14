---
"react-impulse": patch
"react-impulse-form": patch
---

Refactor scope emitter architecture to eliminate version tracking and improve derived impulse synchronization. The new implementation uses a stale flag mechanism in `DerivedImpulse` instead of version comparison, streamlining invalidation logic and reducing overhead. The `ScopeEmitter` now leverages a `ScopeFactory` pattern with lazy scope creation, ensuring that derived impulses maintain consistent state across reads while properly invalidating when dependencies change. Additionally, the `_setter` signature has been simplified to return a boolean flag indicating whether emission is needed, centralizing the queue push logic in `BaseImpulse#setValue`.

**Internal Changes:**

- Replaced version tracking (`_version`) with stale flag (`_stale`) in `DerivedImpulse`
- Introduced `ScopeFactory` class for managing scope creation and emission lifecycle
- Simplified `_setter` signature to return `void | true` instead of accepting queue parameter
- Moved `Emitter` class from `react-impulse-form` to shared `tools` package
- Enhanced `map` utility to accept both arrays and iterables
- Removed obsolete `uniq` utility in favor of native `Set`
