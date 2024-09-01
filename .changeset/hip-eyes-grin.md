---
"react-impulse-form": minor
---

1. `ImpulseForm#setInitialValue` receives two parameters in the callback:
   - initial value
   - current (original) value
1. `ImpulseForm#setOriginalValue` receives two parameters in the callback:
   - current (original) value
   - initial value
1. `ImpulseFormList#reset` and `ImpulseFormList#isDirty` work correctly for removed/added items (Resolves #694)
