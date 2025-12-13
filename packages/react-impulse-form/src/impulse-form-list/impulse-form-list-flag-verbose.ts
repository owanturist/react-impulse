import type { GetSignalFormFlagVerbose } from "../impulse-form/get-impulse-form-flag-verbose"
import type { SignalForm } from "../impulse-form/impulse-form"

type FormListFlagVerbose<TElement extends SignalForm> = ReadonlyArray<
  GetSignalFormFlagVerbose<TElement>
>

export type { FormListFlagVerbose }
