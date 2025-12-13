import type { GetSignalFormParam } from "./get-impulse-form-param"
import type { SignalForm } from "./impulse-form"

type GetSignalFormValidateOn<TForm extends SignalForm> = GetSignalFormParam<
  TForm,
  "validateOn.schema"
>

export type { GetSignalFormValidateOn }
