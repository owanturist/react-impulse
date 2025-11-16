import { ImpulseFormShape } from "./_impulse-form-shape"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"

export function isImpulseFormShape(
  value: unknown,
): value is ImpulseFormShape<ImpulseFormShapeFields> {
  return value instanceof ImpulseFormShape
}
