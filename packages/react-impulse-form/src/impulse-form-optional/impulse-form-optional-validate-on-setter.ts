import type { Setter } from "~/tools/setter"

import type { GetSignalFormParam } from "../impulse-form/get-impulse-form-param"
import type { SignalForm } from "../impulse-form/impulse-form"
import type { ValidateStrategy } from "../validate-strategy"

import type { FormOptionalSchema } from "./impulse-form-optional-schema"
import type { FormOptionalValidateOnVerbose } from "./impulse-form-optional-validate-on-verbose"

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
