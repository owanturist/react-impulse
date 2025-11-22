import type { GetImpulseFormShapeParam } from "./get-impulse-form-shape-param"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"

type ImpulseFormShapeErrorVerbose<TFields extends ImpulseFormShapeFields> =
  GetImpulseFormShapeParam<TFields, "error.schema.verbose">

export type { ImpulseFormShapeErrorVerbose }
