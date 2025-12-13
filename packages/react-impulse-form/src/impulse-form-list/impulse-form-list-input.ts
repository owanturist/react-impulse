import type { GetSignalFormInput } from "../impulse-form/get-impulse-form-input"
import type { SignalForm } from "../impulse-form/impulse-form"

type FormListInput<TElement extends SignalForm> = ReadonlyArray<GetSignalFormInput<TElement>>

export type { FormListInput }
