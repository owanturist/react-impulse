import type { GetSignalFormParam } from "./get-signal-form-param"
import type { SignalForm } from "./signal-form"

type GetSignalFormFlagSetter<TForm extends SignalForm> = GetSignalFormParam<TForm, "flag.setter">

export type { GetSignalFormFlagSetter }
