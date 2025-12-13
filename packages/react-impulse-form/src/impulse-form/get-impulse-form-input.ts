import type { GetSignalFormParam } from "./get-impulse-form-param"
import type { SignalForm } from "./impulse-form"

type GetSignalFormInput<TForm extends SignalForm> = GetSignalFormParam<TForm, "input.schema">

export type { GetSignalFormInput }
