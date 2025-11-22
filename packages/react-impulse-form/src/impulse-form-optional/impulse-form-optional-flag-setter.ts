import type { Setter } from "~/tools/setter"

import type { GetImpulseFormParam, ImpulseForm } from "../impulse-form"

import type { ImpulseFormOptionalFlagVerbose } from "./impulse-form-optional-flag-verbose"
import type { ImpulseFormOptionalSchema } from "./impulse-form-optional-schema"

type ImpulseFormOptionalFlagSetter<
  TEnabled extends ImpulseForm,
  TElement extends ImpulseForm,
> = Setter<
  | boolean
  | Partial<
      ImpulseFormOptionalSchema<
        GetImpulseFormParam<TEnabled, "flag.setter">,
        GetImpulseFormParam<TElement, "flag.setter">
      >
    >,
  [ImpulseFormOptionalFlagVerbose<TEnabled, TElement>]
>

export type { ImpulseFormOptionalFlagSetter }
