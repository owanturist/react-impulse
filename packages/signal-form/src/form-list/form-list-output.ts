import type { GetSignalFormOutput } from "../signal-form/get-signal-form-output"
import type { SignalForm } from "../signal-form/signal-form"

type FormListOutput<TElement extends SignalForm> = ReadonlyArray<GetSignalFormOutput<TElement>>

export type { FormListOutput }
