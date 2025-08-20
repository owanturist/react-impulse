import type { Setter } from "~/tools/setter"

import type { GetImpulseFormParam } from "../impulse-form/get-impulse-form-param"
import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { ImpulseFormOptionalFlagVerbose } from "./impulse-form-optional-flag-verbose"
import type { ImpulseFormOptionalVerboseSchema } from "./impulse-form-optional-verbose-schema"

export type ImpulseFormOptionalFlagSetter<
  TEnabled extends ImpulseForm,
  TElement extends ImpulseForm,
> = Setter<
  | boolean
  | Partial<
      ImpulseFormOptionalVerboseSchema<
        GetImpulseFormParam<TEnabled, "flag.setter">,
        GetImpulseFormParam<TElement, "flag.setter">
      >
    >,
  [ImpulseFormOptionalFlagVerbose<TEnabled, TElement>]
>
