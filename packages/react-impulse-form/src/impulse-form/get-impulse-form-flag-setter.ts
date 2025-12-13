import type { GetSignalFormParam } from "./get-impulse-form-param"
import type { SignalForm } from "./impulse-form"

type GetSignalFormFlagSetter<TForm extends SignalForm> = GetSignalFormParam<TForm, "flag.setter">

export type { GetSignalFormFlagSetter }
