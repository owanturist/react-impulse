import type { SignalForm } from "../impulse-form/impulse-form"

import type { FormSwitchBranches } from "./impulse-form-switch-branches"
import type { FormSwitchVerboseParam } from "./_internal/impulse-form-switch-verbose-param"

type FormSwitchValidateOnVerbose<
  TKind extends SignalForm,
  TBranches extends FormSwitchBranches<TKind>,
> = FormSwitchVerboseParam<TKind, TBranches, "validateOn.schema.verbose">

export type { FormSwitchValidateOnVerbose }
