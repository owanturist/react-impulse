import type { Setter } from "~/tools/setter"

import type { GetSignalFormValidateOnSetter } from "../impulse-form/get-impulse-form-validate-on-setter"
import type { SignalForm } from "../impulse-form/impulse-form"
import type { ValidateStrategy } from "../validate-strategy"

import type { FormListValidateOnVerbose } from "./impulse-form-list-validate-on-verbose"

type FormListValidateOnSetter<TElement extends SignalForm> = Setter<
  ValidateStrategy | ReadonlyArray<undefined | GetSignalFormValidateOnSetter<TElement>>,
  [FormListValidateOnVerbose<TElement>]
>

export type { FormListValidateOnSetter }
