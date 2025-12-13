import type { SignalForm } from "../impulse-form/impulse-form"

import type { FormOptionalParam } from "./_internal/impulse-form-optional-param"

type FormOptionalFlag<TEnabled extends SignalForm, TElement extends SignalForm> = FormOptionalParam<
  TEnabled,
  TElement,
  "flag.schema",
  boolean
>

export type { FormOptionalFlag }
