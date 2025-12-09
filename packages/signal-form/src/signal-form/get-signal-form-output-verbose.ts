import type { GetSignalFormParam } from "./get-signal-form-param"
import type { SignalForm } from "./signal-form"

type GetSignalFormOutputVerbose<TForm extends SignalForm> = GetSignalFormParam<
  TForm,
  "output.schema.verbose"
>

export type { GetSignalFormOutputVerbose }
