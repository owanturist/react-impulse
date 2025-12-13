import type { SignalForm } from "../signal-form/signal-form"

import type { FormOptionalParam } from "./_internal/form-optional-param"

type FormOptionalErrorVerbose<
  TEnabled extends SignalForm,
  TElement extends SignalForm,
> = FormOptionalParam<TEnabled, TElement, "error.schema.verbose">

export type { FormOptionalErrorVerbose }
