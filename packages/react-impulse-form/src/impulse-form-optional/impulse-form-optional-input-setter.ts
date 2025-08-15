import type { Setter } from "~/tools/setter"

import type { GetImpulseFormParam } from "../impulse-form/get-impulse-form-param"
import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { ImpulseFormOptionalInput } from "./impulse-form-optional-input"
import type { ImpulseFormOptionalVerboseSchema } from "./impulse-form-optional-verbose-schema"

export type ImpulseFormOptionalInputSetter<
  TEnabled extends ImpulseForm,
  TElement extends ImpulseForm,
> = Setter<
  Partial<
    ImpulseFormOptionalVerboseSchema<
      GetImpulseFormParam<TEnabled, "input.setter">,
      GetImpulseFormParam<TElement, "input.setter">
    >
  >,
  [
    ImpulseFormOptionalInput<TEnabled, TElement>,
    ImpulseFormOptionalInput<TEnabled, TElement>,
  ]
>
