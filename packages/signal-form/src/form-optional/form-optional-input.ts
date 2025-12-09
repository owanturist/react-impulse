import type { GetSignalFormParam } from "../signal-form/get-signal-form-param"
import type { SignalForm } from "../signal-form/signal-form"

import type { FormOptionalSchema } from "./form-optional-schema"

type FormOptionalInput<
  TEnabled extends SignalForm,
  TElement extends SignalForm,
> = FormOptionalSchema<
  GetSignalFormParam<TEnabled, "input.schema">,
  GetSignalFormParam<TElement, "input.schema">
>

export type { FormOptionalInput }
