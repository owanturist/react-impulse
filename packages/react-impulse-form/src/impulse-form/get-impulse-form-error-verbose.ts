import type { GetSignalFormParam } from "./get-impulse-form-param"
import type { SignalForm } from "./impulse-form"

type GetSignalFormErrorVerbose<TForm extends SignalForm> = GetSignalFormParam<
  TForm,
  "error.schema.verbose"
>

export type { GetSignalFormErrorVerbose }
