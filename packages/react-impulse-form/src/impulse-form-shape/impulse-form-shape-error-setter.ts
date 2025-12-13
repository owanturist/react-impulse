import type { Setter } from "~/tools/setter"

import type { GetFormShapeParam } from "./get-impulse-form-shape-param"
import type { FormShapeErrorVerbose } from "./impulse-form-shape-error-verbose"
import type { FormShapeFields } from "./impulse-form-shape-fields"

type FormShapeErrorSetter<TFields extends FormShapeFields> = Setter<
  null | Partial<GetFormShapeParam<TFields, "error.setter">>,
  [FormShapeErrorVerbose<TFields>]
>

export type { FormShapeErrorSetter }
