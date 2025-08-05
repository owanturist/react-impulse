---
"react-impulse-form": minor
---

Refactor `ImpulseForm` class architecture for better maintainability and type safety

- Added overloaded signatures with optional `select` parameter to `isValid()` and `isInvalid()` methods for consistent API with other flag methods
- Simplified internal architecture by delegating all operations to `_state: ImpulseFormState<TParams>`
