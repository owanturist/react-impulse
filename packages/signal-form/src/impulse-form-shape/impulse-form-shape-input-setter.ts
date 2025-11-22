import type { Setter } from "~/tools/setter"

import type { GetImpulseFormShapeParam } from "./get-impulse-form-shape-param"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"
import type { ImpulseFormShapeInput } from "./impulse-form-shape-input"

type ImpulseFormShapeInputSetter<TFields extends ImpulseFormShapeFields> = Setter<
  Partial<GetImpulseFormShapeParam<TFields, "input.setter">>,
  [ImpulseFormShapeInput<TFields>, ImpulseFormShapeInput<TFields>]
>

export type { ImpulseFormShapeInputSetter }
