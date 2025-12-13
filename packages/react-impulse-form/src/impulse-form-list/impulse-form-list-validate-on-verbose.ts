import type { GetSignalFormValidateOnVerbose } from "../impulse-form/get-impulse-form-validate-on-verbose"
import type { SignalForm } from "../impulse-form/impulse-form"

type FormListValidateOnVerbose<TElement extends SignalForm> = ReadonlyArray<
  GetSignalFormValidateOnVerbose<TElement>
>

export type { FormListValidateOnVerbose }
