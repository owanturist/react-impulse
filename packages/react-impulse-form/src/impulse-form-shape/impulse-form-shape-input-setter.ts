import type { Setter } from "~/tools/setter"

import type { GetFormShapeParam } from "./get-impulse-form-shape-param"
import type { FormShapeFields } from "./impulse-form-shape-fields"
import type { FormShapeInput } from "./impulse-form-shape-input"

type FormShapeInputSetter<TFields extends FormShapeFields> = Setter<
  Partial<GetFormShapeParam<TFields, "input.setter">>,
  [FormShapeInput<TFields>, FormShapeInput<TFields>]
>

export type { FormShapeInputSetter }
