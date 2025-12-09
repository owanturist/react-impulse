import type { GetSignalFormParam } from "./get-signal-form-param"
import type { SignalForm } from "./signal-form"

type GetSignalFormErrorVerbose<TForm extends SignalForm> = GetSignalFormParam<
  TForm,
  "error.schema.verbose"
>

export type { GetSignalFormErrorVerbose }
