import type { GetSignalFormOutputVerbose } from "../signal-form/get-signal-form-output-verbose"
import type { SignalForm } from "../signal-form/signal-form"

type FormListOutputVerbose<TElement extends SignalForm> = ReadonlyArray<
  GetSignalFormOutputVerbose<TElement>
>

export type { FormListOutputVerbose }
