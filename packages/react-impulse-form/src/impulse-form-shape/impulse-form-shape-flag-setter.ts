import type { Setter } from "~/tools/setter"

import type { GetFormShapeParam } from "./get-impulse-form-shape-param"
import type { FormShapeFields } from "./impulse-form-shape-fields"
import type { FormShapeFlagVerbose } from "./impulse-form-shape-flag-verbose"

type FormShapeFlagSetter<TFields extends FormShapeFields> = Setter<
  boolean | Partial<GetFormShapeParam<TFields, "flag.setter">>,
  [FormShapeFlagVerbose<TFields>]
>

export type { FormShapeFlagSetter }
