import type { Setter } from "~/tools/setter"

import type { GetSignalFormFlagSetter } from "../impulse-form/get-impulse-form-flag-setter"
import type { SignalForm } from "../impulse-form/impulse-form"

import type { FormListFlagVerbose } from "./impulse-form-list-flag-verbose"

type FormListFlagSetter<TElement extends SignalForm> = Setter<
  boolean | ReadonlyArray<undefined | GetSignalFormFlagSetter<TElement>>,
  [FormListFlagVerbose<TElement>]
>

export type { FormListFlagSetter }
