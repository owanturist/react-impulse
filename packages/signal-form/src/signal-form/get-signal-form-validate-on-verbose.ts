import type { GetSignalFormParam } from "./get-signal-form-param"
import type { SignalForm } from "./signal-form"

type GetSignalFormValidateOnVerbose<TForm extends SignalForm> = GetSignalFormParam<
  TForm,
  "validateOn.schema.verbose"
>

export type { GetSignalFormValidateOnVerbose }
