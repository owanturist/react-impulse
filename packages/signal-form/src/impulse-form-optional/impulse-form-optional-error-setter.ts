import type { Setter } from "~/tools/setter"

import type { GetImpulseFormParam } from "../impulse-form/get-impulse-form-param"
import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { ImpulseFormOptionalErrorVerbose } from "./impulse-form-optional-error-verbose"
import type { ImpulseFormOptionalSchema } from "./impulse-form-optional-schema"

type ImpulseFormOptionalErrorSetter<
  TEnabled extends ImpulseForm,
  TElement extends ImpulseForm,
> = Setter<
  null | Partial<
    ImpulseFormOptionalSchema<
      GetImpulseFormParam<TEnabled, "error.setter">,
      GetImpulseFormParam<TElement, "error.setter">
    >
  >,
  [ImpulseFormOptionalErrorVerbose<TEnabled, TElement>]
>

export type { ImpulseFormOptionalErrorSetter }
