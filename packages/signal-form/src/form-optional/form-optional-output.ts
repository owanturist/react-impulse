import type { GetSignalFormParam } from "../signal-form/get-signal-form-param"
import type { SignalForm } from "../signal-form/signal-form"

type FormOptionalOutput<TElement extends SignalForm> =
  | undefined
  | GetSignalFormParam<TElement, "output.schema">

export type { FormOptionalOutput }
