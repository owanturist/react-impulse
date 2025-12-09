import type { Setter } from "~/tools/setter"

import type { FormShapeErrorVerbose } from "./form-shape-error-verbose"
import type { FormShapeFields } from "./form-shape-fields"
import type { GetFormShapeParam } from "./get-form-shape-param"

type FormShapeErrorSetter<TFields extends FormShapeFields> = Setter<
  null | Partial<GetFormShapeParam<TFields, "error.setter">>,
  [FormShapeErrorVerbose<TFields>]
>

export type { FormShapeErrorSetter }
