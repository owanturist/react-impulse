import type { FormShapeFields } from "./impulse-form-shape-fields"
import { FormShape } from "./_internal/impulse-form-shape"

function isFormShape(value: unknown): value is FormShape<FormShapeFields> {
  return value instanceof FormShape
}

export { isFormShape }
