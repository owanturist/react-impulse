import type { Setter } from "~/tools/setter"

import type { GetSignalFormParam } from "../impulse-form/get-impulse-form-param"
import type { SignalForm } from "../impulse-form/impulse-form"

import type { FormOptionalInput } from "./impulse-form-optional-input"
import type { FormOptionalSchema } from "./impulse-form-optional-schema"

type FormOptionalInputSetter<TEnabled extends SignalForm, TElement extends SignalForm> = Setter<
  Partial<
    FormOptionalSchema<
      GetSignalFormParam<TEnabled, "input.setter">,
      GetSignalFormParam<TElement, "input.setter">
    >
  >,
  [FormOptionalInput<TEnabled, TElement>, FormOptionalInput<TEnabled, TElement>]
>

export type { FormOptionalInputSetter }
