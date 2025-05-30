import { ImpulseFormShape } from "./_impulse-form-shape"

export function isImpulseFormShape(value: unknown): value is ImpulseFormShape {
  return value instanceof ImpulseFormShape
}
