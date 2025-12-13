import type { GetSignalFormParam } from "../impulse-form/get-impulse-form-param"
import type { SignalForm } from "../impulse-form/impulse-form"

import type { FormOptionalSchema } from "./impulse-form-optional-schema"

type FormOptionalInput<
  TEnabled extends SignalForm,
  TElement extends SignalForm,
> = FormOptionalSchema<
  GetSignalFormParam<TEnabled, "input.schema">,
  GetSignalFormParam<TElement, "input.schema">
>

export type { FormOptionalInput }
