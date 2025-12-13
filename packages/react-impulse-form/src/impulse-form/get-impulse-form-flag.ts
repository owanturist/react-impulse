import type { GetSignalFormParam } from "./get-impulse-form-param"
import type { SignalForm } from "./impulse-form"

type GetSignalFormFlag<TForm extends SignalForm> = GetSignalFormParam<TForm, "flag.schema">

export type { GetSignalFormFlag }
