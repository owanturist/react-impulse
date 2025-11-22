import type { Setter } from "~/tools/setter"

import type { GetImpulseFormParam, ImpulseForm } from "../impulse-form"
import type { ValidateStrategy } from "../validate-strategy"

import type { ImpulseFormOptionalSchema } from "./impulse-form-optional-schema"
import type { ImpulseFormOptionalValidateOnVerbose } from "./impulse-form-optional-validate-on-verbose"

type ImpulseFormOptionalValidateOnSetter<
  TEnabled extends ImpulseForm,
  TElement extends ImpulseForm,
> = Setter<
  | ValidateStrategy
  | Partial<
      ImpulseFormOptionalSchema<
        GetImpulseFormParam<TEnabled, "validateOn.setter">,
        GetImpulseFormParam<TElement, "validateOn.setter">
      >
    >,
  [ImpulseFormOptionalValidateOnVerbose<TEnabled, TElement>]
>

export type { ImpulseFormOptionalValidateOnSetter }
