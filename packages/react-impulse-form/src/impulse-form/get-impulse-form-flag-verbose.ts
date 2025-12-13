import type { GetSignalFormParam } from "./get-impulse-form-param"
import type { SignalForm } from "./impulse-form"

type GetSignalFormFlagVerbose<TForm extends SignalForm> = GetSignalFormParam<
  TForm,
  "flag.schema.verbose"
>

export type { GetSignalFormFlagVerbose }
