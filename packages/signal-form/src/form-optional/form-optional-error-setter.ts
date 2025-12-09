import type { Setter } from "~/tools/setter"

import type { GetSignalFormParam } from "../signal-form/get-signal-form-param"
import type { SignalForm } from "../signal-form/signal-form"

import type { FormOptionalErrorVerbose } from "./form-optional-error-verbose"
import type { FormOptionalSchema } from "./form-optional-schema"

type FormOptionalErrorSetter<TEnabled extends SignalForm, TElement extends SignalForm> = Setter<
  null | Partial<
    FormOptionalSchema<
      GetSignalFormParam<TEnabled, "error.setter">,
      GetSignalFormParam<TElement, "error.setter">
    >
  >,
  [FormOptionalErrorVerbose<TEnabled, TElement>]
>

export type { FormOptionalErrorSetter }
