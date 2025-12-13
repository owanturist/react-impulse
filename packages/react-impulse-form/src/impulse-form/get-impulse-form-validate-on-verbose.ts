import type { GetSignalFormParam } from "./get-impulse-form-param"
import type { SignalForm } from "./impulse-form"

type GetSignalFormValidateOnVerbose<TForm extends SignalForm> = GetSignalFormParam<
  TForm,
  "validateOn.schema.verbose"
>

export type { GetSignalFormValidateOnVerbose }
