import type { Setter } from "~/tools/setter"

import type { GetSignalFormParam } from "../impulse-form/get-impulse-form-param"
import type { SignalForm } from "../impulse-form/impulse-form"

import type { FormOptionalFlagVerbose } from "./impulse-form-optional-flag-verbose"
import type { FormOptionalSchema } from "./impulse-form-optional-schema"

type FormOptionalFlagSetter<TEnabled extends SignalForm, TElement extends SignalForm> = Setter<
  | boolean
  | Partial<
      FormOptionalSchema<
        GetSignalFormParam<TEnabled, "flag.setter">,
        GetSignalFormParam<TElement, "flag.setter">
      >
    >,
  [FormOptionalFlagVerbose<TEnabled, TElement>]
>

export type { FormOptionalFlagSetter }
