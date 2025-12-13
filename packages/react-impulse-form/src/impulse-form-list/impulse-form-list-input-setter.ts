import type { Setter } from "~/tools/setter"

import type { GetSignalFormInputSetter } from "../impulse-form/get-impulse-form-input-setter"
import type { SignalForm } from "../impulse-form/impulse-form"

import type { FormListInput } from "./impulse-form-list-input"

type FormListInputSetter<TElement extends SignalForm> = Setter<
  ReadonlyArray<undefined | GetSignalFormInputSetter<TElement>>,
  [FormListInput<TElement>, FormListInput<TElement>]
>

export type { FormListInputSetter }
