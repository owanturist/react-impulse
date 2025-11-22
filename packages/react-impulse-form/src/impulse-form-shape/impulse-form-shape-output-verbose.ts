import type { GetImpulseFormShapeParam } from "./get-impulse-form-shape-param"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"

type ImpulseFormShapeOutputVerbose<TFields extends ImpulseFormShapeFields> =
  GetImpulseFormShapeParam<TFields, "output.schema.verbose">

export type { ImpulseFormShapeOutputVerbose }
