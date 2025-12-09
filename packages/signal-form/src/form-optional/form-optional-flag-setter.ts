import type { Setter } from "~/tools/setter"

import type { GetSignalFormParam } from "../signal-form/get-signal-form-param"
import type { SignalForm } from "../signal-form/signal-form"

import type { FormOptionalFlagVerbose } from "./form-optional-flag-verbose"
import type { FormOptionalSchema } from "./form-optional-schema"

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
