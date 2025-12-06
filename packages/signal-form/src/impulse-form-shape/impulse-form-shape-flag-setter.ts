import type { Setter } from "~/tools/setter"

import type { GetImpulseFormShapeParam } from "./get-impulse-form-shape-param"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"
import type { ImpulseFormShapeFlagVerbose } from "./impulse-form-shape-flag-verbose"

type ImpulseFormShapeFlagSetter<TFields extends ImpulseFormShapeFields> = Setter<
  boolean | Partial<GetImpulseFormShapeParam<TFields, "flag.setter">>,
  [ImpulseFormShapeFlagVerbose<TFields>]
>

export type { ImpulseFormShapeFlagSetter }
