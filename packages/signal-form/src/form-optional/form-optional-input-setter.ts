import type { Setter } from "~/tools/setter"

import type { GetSignalFormParam } from "../signal-form/get-signal-form-param"
import type { SignalForm } from "../signal-form/signal-form"

import type { FormOptionalInput } from "./form-optional-input"
import type { FormOptionalSchema } from "./form-optional-schema"

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
