import type { GetSignalFormParam } from "./get-impulse-form-param"
import type { SignalForm } from "./impulse-form"

type GetSignalFormError<TForm extends SignalForm> = GetSignalFormParam<TForm, "error.schema">

export type { GetSignalFormError }
