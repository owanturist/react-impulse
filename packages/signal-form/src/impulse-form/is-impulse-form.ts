import { ImpulseForm } from "./_internal/impulse-form"

function isImpulseForm(value: unknown): value is ImpulseForm {
  return value instanceof ImpulseForm
}

export { isImpulseForm }
