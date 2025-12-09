import type { GetSignalFormFlagVerbose } from "../signal-form/get-signal-form-flag-verbose"
import type { SignalForm } from "../signal-form/signal-form"

type FormListFlagVerbose<TElement extends SignalForm> = ReadonlyArray<
  GetSignalFormFlagVerbose<TElement>
>

export type { FormListFlagVerbose }
