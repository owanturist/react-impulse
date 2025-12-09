import type { GetSignalFormParam } from "./get-signal-form-param"
import type { SignalForm } from "./signal-form"

type GetSignalFormFlagVerbose<TForm extends SignalForm> = GetSignalFormParam<
  TForm,
  "flag.schema.verbose"
>

export type { GetSignalFormFlagVerbose }
