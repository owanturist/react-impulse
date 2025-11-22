import type { GetImpulseFormShapeParam } from "./get-impulse-form-shape-param"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"

type ImpulseFormShapeValidateOnVerbose<TFields extends ImpulseFormShapeFields> =
  GetImpulseFormShapeParam<TFields, "validateOn.schema.verbose">

export type { ImpulseFormShapeValidateOnVerbose }
