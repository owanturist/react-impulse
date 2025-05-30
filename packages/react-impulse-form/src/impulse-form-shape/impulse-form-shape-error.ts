import type { GetImpulseFormShapeParam } from "./get-impulse-form-shape-param"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"

export type ImpulseFormShapeError<TFields extends ImpulseFormShapeFields> =
  null | GetImpulseFormShapeParam<TFields, "error.schema">
