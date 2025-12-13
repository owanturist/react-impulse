import type { GetSignalFormParam } from "./get-impulse-form-param"
import type { SignalForm } from "./impulse-form"

type GetSignalFormValidateOnSetter<TForm extends SignalForm> = GetSignalFormParam<
  TForm,
  "validateOn.setter"
>

export type { GetSignalFormValidateOnSetter }
