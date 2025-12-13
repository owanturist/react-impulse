import type { GetSignalFormParam } from "./get-impulse-form-param"
import type { SignalForm } from "./impulse-form"

type GetSignalFormInputSetter<TForm extends SignalForm> = GetSignalFormParam<TForm, "input.setter">

export type { GetSignalFormInputSetter }
