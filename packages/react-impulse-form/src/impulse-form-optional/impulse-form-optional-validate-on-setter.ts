import type { Setter } from "~/tools/setter"

import type { GetImpulseFormParam } from "../impulse-form/get-impulse-form-param"
import type { ImpulseForm } from "../impulse-form/impulse-form"
import type { ValidateStrategy } from "../validate-strategy"

import type { ImpulseFormOptionalValidateOnVerbose } from "./impulse-form-optional-validate-on-verbose"
import type { ImpulseFormOptionalVerboseSchema } from "./impulse-form-optional-verbose-schema"

export type ImpulseFormOptionalValidateOnSetter<
  TEnabled extends ImpulseForm,
  TElement extends ImpulseForm,
> = Setter<
  | ValidateStrategy
  | Partial<
      ImpulseFormOptionalVerboseSchema<
        GetImpulseFormParam<TEnabled, "validateOn.setter">,
        GetImpulseFormParam<TElement, "validateOn.setter">
      >
    >,
  [ImpulseFormOptionalValidateOnVerbose<TEnabled, TElement>]
>
