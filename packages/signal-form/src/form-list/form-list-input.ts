import type { GetSignalFormInput } from "../signal-form/get-signal-form-input"
import type { SignalForm } from "../signal-form/signal-form"

type FormListInput<TElement extends SignalForm> = ReadonlyArray<GetSignalFormInput<TElement>>

export type { FormListInput }
