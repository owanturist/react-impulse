import type { GetSignalFormParam } from "./get-signal-form-param"
import type { SignalForm } from "./signal-form"

type GetSignalFormValidateOn<TForm extends SignalForm> = GetSignalFormParam<
  TForm,
  "validateOn.schema"
>

export type { GetSignalFormValidateOn }
