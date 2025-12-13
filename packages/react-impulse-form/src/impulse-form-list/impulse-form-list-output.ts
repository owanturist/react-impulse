import type { GetSignalFormOutput } from "../impulse-form/get-impulse-form-output"
import type { SignalForm } from "../impulse-form/impulse-form"

type FormListOutput<TElement extends SignalForm> = ReadonlyArray<GetSignalFormOutput<TElement>>

export type { FormListOutput }
