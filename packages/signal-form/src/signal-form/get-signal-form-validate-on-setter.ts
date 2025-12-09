import type { GetSignalFormParam } from "./get-signal-form-param"
import type { SignalForm } from "./signal-form"

type GetSignalFormValidateOnSetter<TForm extends SignalForm> = GetSignalFormParam<
  TForm,
  "validateOn.setter"
>

export type { GetSignalFormValidateOnSetter }
