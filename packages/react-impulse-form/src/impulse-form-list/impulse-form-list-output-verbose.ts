import type { GetSignalFormOutputVerbose } from "../impulse-form/get-impulse-form-output-verbose"
import type { SignalForm } from "../impulse-form/impulse-form"

type FormListOutputVerbose<TElement extends SignalForm> = ReadonlyArray<
  GetSignalFormOutputVerbose<TElement>
>

export type { FormListOutputVerbose }
