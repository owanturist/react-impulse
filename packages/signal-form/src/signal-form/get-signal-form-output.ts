import type { GetSignalFormParam } from "./get-signal-form-param"
import type { SignalForm } from "./signal-form"

type GetSignalFormOutput<TForm extends SignalForm> = GetSignalFormParam<TForm, "output.schema">

export type { GetSignalFormOutput }
