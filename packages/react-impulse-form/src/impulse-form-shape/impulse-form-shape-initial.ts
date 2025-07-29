import type { GetImpulseFormShapeParam } from "./get-impulse-form-shape-param"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"

export type ImpulseFormShapeInitial<TFields extends ImpulseFormShapeFields> =
  GetImpulseFormShapeParam<TFields, "initial">
