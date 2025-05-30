import type { GetImpulseFormShapeParam } from "./get-impulse-form-shape-param"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"

export type ImpulseFormShapeValidateOnVerbose<
  TFields extends ImpulseFormShapeFields,
> = GetImpulseFormShapeParam<TFields, "validateOn.schema.verbose">
