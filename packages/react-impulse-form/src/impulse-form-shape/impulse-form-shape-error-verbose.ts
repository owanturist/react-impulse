import type { GetImpulseFormShapeParam } from "./get-impulse-form-shape-param"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"

export type ImpulseFormShapeErrorVerbose<
  TFields extends ImpulseFormShapeFields,
> = GetImpulseFormShapeParam<TFields, "error.schema.verbose">
