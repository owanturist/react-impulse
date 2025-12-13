import type { GetSignalFormErrorVerbose } from "../impulse-form/get-impulse-form-error-verbose"
import type { SignalForm } from "../impulse-form/impulse-form"

type FormListErrorVerbose<TElement extends SignalForm> = ReadonlyArray<
  GetSignalFormErrorVerbose<TElement>
>

export type { FormListErrorVerbose }
