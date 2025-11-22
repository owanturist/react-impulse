import type { GetImpulseFormShapeParam } from "./get-impulse-form-shape-param"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"

type ImpulseFormShapeInput<TFields extends ImpulseFormShapeFields> = GetImpulseFormShapeParam<
  TFields,
  "input.schema"
>

export type { ImpulseFormShapeInput }
