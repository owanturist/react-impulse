import type { Setter } from "~/tools/setter"

import type { GetImpulseFormParam } from "../impulse-form/get-impulse-form-param"
import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { ImpulseFormOptionalErrorVerbose } from "./impulse-form-optional-error-verbose"
import type { ImpulseFormOptionalVerboseSchema } from "./impulse-form-optional-verbose-schema"

export type ImpulseFormOptionalErrorSetter<
  TEnabled extends ImpulseForm,
  TElement extends ImpulseForm,
> = Setter<
  null | Partial<
    ImpulseFormOptionalVerboseSchema<
      GetImpulseFormParam<TEnabled, "error.setter">,
      GetImpulseFormParam<TElement, "error.setter">
    >
  >,
  [ImpulseFormOptionalErrorVerbose<TEnabled, TElement>]
>
