import type { Setter } from "~/tools/setter"

import type { GetSignalFormParam } from "../signal-form/get-signal-form-param"
import type { SignalForm } from "../signal-form/signal-form"
import type { ValidateStrategy } from "../validate-strategy"

import type { FormOptionalSchema } from "./form-optional-schema"
import type { FormOptionalValidateOnVerbose } from "./form-optional-validate-on-verbose"

type FormOptionalValidateOnSetter<
  TEnabled extends SignalForm,
  TElement extends SignalForm,
> = Setter<
  | ValidateStrategy
  | Partial<
      FormOptionalSchema<
        GetSignalFormParam<TEnabled, "validateOn.setter">,
        GetSignalFormParam<TElement, "validateOn.setter">
      >
    >,
  [FormOptionalValidateOnVerbose<TEnabled, TElement>]
>

export type { FormOptionalValidateOnSetter }
