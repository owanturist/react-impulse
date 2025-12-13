import type { GetSignalFormParam } from "./get-impulse-form-param"
import type { SignalForm } from "./impulse-form"

type GetSignalFormOutput<TForm extends SignalForm> = GetSignalFormParam<TForm, "output.schema">

export type { GetSignalFormOutput }
