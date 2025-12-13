import type { SignalForm } from "../impulse-form/impulse-form"

import type { FormOptionalParam } from "./_internal/impulse-form-optional-param"

type FormOptionalErrorVerbose<
  TEnabled extends SignalForm,
  TElement extends SignalForm,
> = FormOptionalParam<TEnabled, TElement, "error.schema.verbose">

export type { FormOptionalErrorVerbose }
