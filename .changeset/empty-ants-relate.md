---
"react-impulse": patch
---

Extract `ScopeEmitQueue` and `enqueue` function from `scope-emitter.ts` into a dedicated `enqueue.ts` module, and move `ScopeFactory` into its own `scope-factory.ts` file. This reorganization improves code modularity by separating concerns: the queue management logic is isolated from the emitter lifecycle, while the factory gets its own dedicated space. Additionally, simplifies the `ScopeEmitter` constructor by accepting the `_emit` callback directly instead of wrapping it internally, reducing unnecessary closures.
