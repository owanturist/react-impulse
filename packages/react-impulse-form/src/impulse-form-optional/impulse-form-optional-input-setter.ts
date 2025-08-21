import type { Setter } from "~/tools/setter"

import type { GetImpulseFormParam } from "../impulse-form/get-impulse-form-param"
import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { ImpulseFormOptionalInput } from "./impulse-form-optional-input"
import type { ImpulseFormOptionalSchema } from "./impulse-form-optional-schema"

export type ImpulseFormOptionalInputSetter<
  TEnabled extends ImpulseForm,
  TElement extends ImpulseForm,
> = Setter<
  Partial<
    ImpulseFormOptionalSchema<
      GetImpulseFormParam<TEnabled, "input.setter">,
      GetImpulseFormParam<TElement, "input.setter">
    >
  >,
  [
    ImpulseFormOptionalInput<TEnabled, TElement>,
    ImpulseFormOptionalInput<TEnabled, TElement>,
  ]
>
