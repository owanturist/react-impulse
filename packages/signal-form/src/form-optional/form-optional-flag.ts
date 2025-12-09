import type { SignalForm } from "../signal-form/signal-form"

import type { FormOptionalParam } from "./_internal/form-optional-param"

type FormOptionalFlag<TEnabled extends SignalForm, TElement extends SignalForm> = FormOptionalParam<
  TEnabled,
  TElement,
  "flag.schema",
  boolean
>

export type { FormOptionalFlag }
