import type { GetSignalFormErrorVerbose } from "../signal-form/get-signal-form-error-verbose"
import type { SignalForm } from "../signal-form/signal-form"

type FormListErrorVerbose<TElement extends SignalForm> = ReadonlyArray<
  GetSignalFormErrorVerbose<TElement>
>

export type { FormListErrorVerbose }
