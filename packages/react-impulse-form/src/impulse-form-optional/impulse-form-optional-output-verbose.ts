import type { SignalForm } from "../impulse-form/impulse-form"

import type { FormOptionalParam } from "./_internal/impulse-form-optional-param"

type FormOptionalOutputVerbose<
  TEnabled extends SignalForm,
  TElement extends SignalForm,
> = FormOptionalParam<TEnabled, TElement, "output.schema.verbose">

export type { FormOptionalOutputVerbose }
