import type { GetSignalFormParam } from "./get-impulse-form-param"
import type { SignalForm } from "./impulse-form"

type GetSignalFormOutputVerbose<TForm extends SignalForm> = GetSignalFormParam<
  TForm,
  "output.schema.verbose"
>

export type { GetSignalFormOutputVerbose }
