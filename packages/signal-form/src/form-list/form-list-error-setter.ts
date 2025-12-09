import type { Setter } from "~/tools/setter"

import type { GetSignalFormErrorSetter } from "../signal-form/get-signal-form-error-setter"
import type { SignalForm } from "../signal-form/signal-form"

import type { FormListErrorVerbose } from "./form-list-error-verbose"

type FormListErrorSetter<TElement extends SignalForm> = Setter<
  null | ReadonlyArray<undefined | GetSignalFormErrorSetter<TElement>>,
  [FormListErrorVerbose<TElement>]
>

export type { FormListErrorSetter }
