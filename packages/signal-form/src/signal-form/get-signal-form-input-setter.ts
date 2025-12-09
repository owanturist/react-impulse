import type { GetSignalFormParam } from "./get-signal-form-param"
import type { SignalForm } from "./signal-form"

type GetSignalFormInputSetter<TForm extends SignalForm> = GetSignalFormParam<TForm, "input.setter">

export type { GetSignalFormInputSetter }
