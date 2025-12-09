import type { Setter } from "~/tools/setter"

import type { GetSignalFormInputSetter } from "../signal-form/get-signal-form-input-setter"
import type { SignalForm } from "../signal-form/signal-form"

import type { FormListInput } from "./form-list-input"

type FormListInputSetter<TElement extends SignalForm> = Setter<
  ReadonlyArray<undefined | GetSignalFormInputSetter<TElement>>,
  [FormListInput<TElement>, FormListInput<TElement>]
>

export type { FormListInputSetter }
