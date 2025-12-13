import type { Setter } from "~/tools/setter"

import type { GetSignalFormParam } from "../impulse-form/get-impulse-form-param"
import type { SignalForm } from "../impulse-form/impulse-form"

import type { FormOptionalErrorVerbose } from "./impulse-form-optional-error-verbose"
import type { FormOptionalSchema } from "./impulse-form-optional-schema"

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
