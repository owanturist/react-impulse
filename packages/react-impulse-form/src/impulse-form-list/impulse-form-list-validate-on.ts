import type { GetSignalFormValidateOn } from "../impulse-form/get-impulse-form-validate-on"
import type { SignalForm } from "../impulse-form/impulse-form"
import type { ValidateStrategy } from "../validate-strategy"

type FormListValidateOn<TElement extends SignalForm> =
  | ValidateStrategy
  | ReadonlyArray<GetSignalFormValidateOn<TElement>>

export type { FormListValidateOn }
