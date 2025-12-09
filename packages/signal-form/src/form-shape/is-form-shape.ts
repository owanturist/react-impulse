import type { FormShapeFields } from "./form-shape-fields"
import { FormShape } from "./_internal/form-shape"

function isFormShape(value: unknown): value is FormShape<FormShapeFields> {
  return value instanceof FormShape
}

export { isFormShape }
