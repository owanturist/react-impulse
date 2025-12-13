import type { SignalForm } from "../impulse-form/impulse-form"

import type { FormOptionalParam } from "./_internal/impulse-form-optional-param"

type FormOptionalFlagVerbose<
  TEnabled extends SignalForm,
  TElement extends SignalForm,
> = FormOptionalParam<TEnabled, TElement, "flag.schema.verbose">

export type { FormOptionalFlagVerbose }
