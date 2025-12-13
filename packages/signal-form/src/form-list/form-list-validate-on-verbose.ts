import type { GetSignalFormValidateOnVerbose } from "../signal-form/get-signal-form-validate-on-verbose"
import type { SignalForm } from "../signal-form/signal-form"

type FormListValidateOnVerbose<TElement extends SignalForm> = ReadonlyArray<
  GetSignalFormValidateOnVerbose<TElement>
>

export type { FormListValidateOnVerbose }
