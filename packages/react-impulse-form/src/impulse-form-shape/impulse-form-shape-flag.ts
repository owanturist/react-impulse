import type { GetImpulseFormShapeParam } from "./get-impulse-form-shape-param"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"

export type ImpulseFormShapeFlag<TFields extends ImpulseFormShapeFields> =
  | boolean
  | GetImpulseFormShapeParam<TFields, "flag.schema">
