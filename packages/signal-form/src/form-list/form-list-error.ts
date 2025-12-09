import type { GetSignalFormError } from "../signal-form/get-signal-form-error"
import type { SignalForm } from "../signal-form/signal-form"

type FormListError<TElement extends SignalForm> = null | ReadonlyArray<GetSignalFormError<TElement>>

export type { FormListError }
