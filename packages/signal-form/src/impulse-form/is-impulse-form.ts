import { ImpulseForm } from "./impulse-form"

export function isImpulseForm(value: unknown): value is ImpulseForm {
  return value instanceof ImpulseForm
}
