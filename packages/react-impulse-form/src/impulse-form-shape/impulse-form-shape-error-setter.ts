import type { Setter } from "~/tools/setter"

import type { GetImpulseFormShapeParam } from "./get-impulse-form-shape-param"
import type { ImpulseFormShapeErrorVerbose } from "./impulse-form-shape-error-verbose"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"

export type ImpulseFormShapeErrorSetter<
  TFields extends ImpulseFormShapeFields,
> = Setter<
  null | Partial<GetImpulseFormShapeParam<TFields, "error.setter">>,
  [ImpulseFormShapeErrorVerbose<TFields>]
>
