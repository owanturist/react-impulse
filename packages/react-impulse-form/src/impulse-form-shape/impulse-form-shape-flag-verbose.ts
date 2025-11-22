import type { GetImpulseFormShapeParam } from "./get-impulse-form-shape-param"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"

type ImpulseFormShapeFlagVerbose<TFields extends ImpulseFormShapeFields> = GetImpulseFormShapeParam<
  TFields,
  "flag.schema.verbose"
>

export type { ImpulseFormShapeFlagVerbose }
