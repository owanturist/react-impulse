import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"
import { ImpulseFormShape } from "./_internal/impulse-form-shape"

function isImpulseFormShape(value: unknown): value is ImpulseFormShape<ImpulseFormShapeFields> {
  return value instanceof ImpulseFormShape
}

export { isImpulseFormShape }
