import type { SignalForm } from "../signal-form/signal-form"

import type { FormOptionalParam } from "./_internal/form-optional-param"

type FormOptionalFlagVerbose<
  TEnabled extends SignalForm,
  TElement extends SignalForm,
> = FormOptionalParam<TEnabled, TElement, "flag.schema.verbose">

export type { FormOptionalFlagVerbose }
