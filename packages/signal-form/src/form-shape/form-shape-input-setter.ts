import type { Setter } from "~/tools/setter"

import type { FormShapeFields } from "./form-shape-fields"
import type { FormShapeInput } from "./form-shape-input"
import type { GetFormShapeParam } from "./get-form-shape-param"

type FormShapeInputSetter<TFields extends FormShapeFields> = Setter<
  Partial<GetFormShapeParam<TFields, "input.setter">>,
  [FormShapeInput<TFields>, FormShapeInput<TFields>]
>

export type { FormShapeInputSetter }
