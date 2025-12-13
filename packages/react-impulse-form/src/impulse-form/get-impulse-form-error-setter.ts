import type { GetSignalFormParam } from "./get-impulse-form-param"
import type { SignalForm } from "./impulse-form"

type GetSignalFormErrorSetter<TForm extends SignalForm> = GetSignalFormParam<TForm, "error.setter">

export type { GetSignalFormErrorSetter }
