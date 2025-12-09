import type { Setter } from "~/tools/setter"

import type { GetSignalFormValidateOnSetter } from "../signal-form/get-signal-form-validate-on-setter"
import type { SignalForm } from "../signal-form/signal-form"
import type { ValidateStrategy } from "../validate-strategy"

import type { FormListValidateOnVerbose } from "./form-list-validate-on-verbose"

type FormListValidateOnSetter<TElement extends SignalForm> = Setter<
  ValidateStrategy | ReadonlyArray<undefined | GetSignalFormValidateOnSetter<TElement>>,
  [FormListValidateOnVerbose<TElement>]
>

export type { FormListValidateOnSetter }
