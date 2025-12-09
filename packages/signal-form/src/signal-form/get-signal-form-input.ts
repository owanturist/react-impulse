import type { GetSignalFormParam } from "./get-signal-form-param"
import type { SignalForm } from "./signal-form"

type GetSignalFormInput<TForm extends SignalForm> = GetSignalFormParam<TForm, "input.schema">

export type { GetSignalFormInput }
