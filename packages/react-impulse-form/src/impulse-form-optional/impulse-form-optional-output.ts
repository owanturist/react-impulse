import type { GetSignalFormParam } from "../impulse-form/get-impulse-form-param"
import type { SignalForm } from "../impulse-form/impulse-form"

type FormOptionalOutput<TElement extends SignalForm> =
  | undefined
  | GetSignalFormParam<TElement, "output.schema">

export type { FormOptionalOutput }
