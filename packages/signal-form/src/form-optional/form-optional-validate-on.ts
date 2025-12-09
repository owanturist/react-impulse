import type { SignalForm } from "../signal-form/signal-form"
import type { ValidateStrategy } from "../validate-strategy"

import type { FormOptionalParam } from "./_internal/form-optional-param"

type FormOptionalValidateOn<
  TEnabled extends SignalForm,
  TElement extends SignalForm,
> = FormOptionalParam<TEnabled, TElement, "validateOn.schema", ValidateStrategy>

export type { FormOptionalValidateOn }
