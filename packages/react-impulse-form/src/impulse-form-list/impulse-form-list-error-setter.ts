import type { Setter } from "~/tools/setter"

import type { GetSignalFormErrorSetter } from "../impulse-form/get-impulse-form-error-setter"
import type { SignalForm } from "../impulse-form/impulse-form"

import type { FormListErrorVerbose } from "./impulse-form-list-error-verbose"

type FormListErrorSetter<TElement extends SignalForm> = Setter<
  null | ReadonlyArray<undefined | GetSignalFormErrorSetter<TElement>>,
  [FormListErrorVerbose<TElement>]
>

export type { FormListErrorSetter }
