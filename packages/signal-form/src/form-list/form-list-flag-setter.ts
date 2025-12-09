import type { Setter } from "~/tools/setter"

import type { GetSignalFormFlagSetter } from "../signal-form/get-signal-form-flag-setter"
import type { SignalForm } from "../signal-form/signal-form"

import type { FormListFlagVerbose } from "./form-list-flag-verbose"

type FormListFlagSetter<TElement extends SignalForm> = Setter<
  boolean | ReadonlyArray<undefined | GetSignalFormFlagSetter<TElement>>,
  [FormListFlagVerbose<TElement>]
>

export type { FormListFlagSetter }
