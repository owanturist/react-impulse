import type { GetSignalFormParam } from "./get-signal-form-param"
import type { SignalForm } from "./signal-form"

type GetSignalFormFlag<TForm extends SignalForm> = GetSignalFormParam<TForm, "flag.schema">

export type { GetSignalFormFlag }
