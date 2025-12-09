import type { GetSignalFormParam } from "./get-signal-form-param"
import type { SignalForm } from "./signal-form"

type GetSignalFormError<TForm extends SignalForm> = GetSignalFormParam<TForm, "error.schema">

export type { GetSignalFormError }
