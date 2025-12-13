import type { GetSignalFormParam } from "./get-signal-form-param"
import type { SignalForm } from "./signal-form"

type GetSignalFormErrorSetter<TForm extends SignalForm> = GetSignalFormParam<TForm, "error.setter">

export type { GetSignalFormErrorSetter }
