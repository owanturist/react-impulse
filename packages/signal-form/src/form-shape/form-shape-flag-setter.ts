import type { Setter } from "~/tools/setter"

import type { FormShapeFields } from "./form-shape-fields"
import type { FormShapeFlagVerbose } from "./form-shape-flag-verbose"
import type { GetFormShapeParam } from "./get-form-shape-param"

type FormShapeFlagSetter<TFields extends FormShapeFields> = Setter<
  boolean | Partial<GetFormShapeParam<TFields, "flag.setter">>,
  [FormShapeFlagVerbose<TFields>]
>

export type { FormShapeFlagSetter }
