import type { GetSignalFormValidateOn } from "../signal-form/get-signal-form-validate-on"
import type { SignalForm } from "../signal-form/signal-form"
import type { ValidateStrategy } from "../validate-strategy"

type FormListValidateOn<TElement extends SignalForm> =
  | ValidateStrategy
  | ReadonlyArray<GetSignalFormValidateOn<TElement>>

export type { FormListValidateOn }
