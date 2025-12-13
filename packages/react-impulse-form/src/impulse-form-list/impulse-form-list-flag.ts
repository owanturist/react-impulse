import type { GetSignalFormFlag } from "../impulse-form/get-impulse-form-flag"
import type { SignalForm } from "../impulse-form/impulse-form"

type FormListFlag<TElement extends SignalForm> =
  | boolean
  | ReadonlyArray<GetSignalFormFlag<TElement>>

export type { FormListFlag }
