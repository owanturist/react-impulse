import type { GetSignalFormError } from "../impulse-form/get-impulse-form-error"
import type { SignalForm } from "../impulse-form/impulse-form"

type FormListError<TElement extends SignalForm> = null | ReadonlyArray<GetSignalFormError<TElement>>

export type { FormListError }
