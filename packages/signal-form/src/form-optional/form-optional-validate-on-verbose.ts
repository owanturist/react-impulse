import type { SignalForm } from "../signal-form/signal-form"

import type { FormOptionalParam } from "./_internal/form-optional-param"

type FormOptionalValidateOnVerbose<
  TEnabled extends SignalForm,
  TElement extends SignalForm,
> = FormOptionalParam<TEnabled, TElement, "validateOn.schema.verbose">

export type { FormOptionalValidateOnVerbose }
