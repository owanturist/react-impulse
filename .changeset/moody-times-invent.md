---
"react-impulse": patch
---

Fix scheduler so nested emissions are not dropped. The scheduler now clears the global queue before processing, allowing emitters enqueued during emit to be processed reliably. This ensures subscribers (created with `subscribe`, `useScopedEffect`, or other scope factories) run when updates are triggered inside subscriber/derived computations (e.g., during `ImpulseForm.reset()`), addressing issue #969.
