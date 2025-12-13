import type { SignalForm } from "../impulse-form/impulse-form"

import type { FormOptionalParam } from "./_internal/impulse-form-optional-param"

type FormOptionalValidateOnVerbose<
  TEnabled extends SignalForm,
  TElement extends SignalForm,
> = FormOptionalParam<TEnabled, TElement, "validateOn.schema.verbose">

export type { FormOptionalValidateOnVerbose }
