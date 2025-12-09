import type { GetSignalFormFlag } from "../signal-form/get-signal-form-flag"
import type { SignalForm } from "../signal-form/signal-form"

type FormListFlag<TElement extends SignalForm> =
  | boolean
  | ReadonlyArray<GetSignalFormFlag<TElement>>

export type { FormListFlag }
