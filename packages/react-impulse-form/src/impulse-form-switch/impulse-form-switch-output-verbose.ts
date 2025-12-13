import type { SignalForm } from "../impulse-form/impulse-form"

import type { FormSwitchBranches } from "./impulse-form-switch-branches"
import type { FormSwitchVerboseParam } from "./_internal/impulse-form-switch-verbose-param"

type FormSwitchOutputVerbose<
  TKind extends SignalForm,
  TBranches extends FormSwitchBranches<TKind>,
> = FormSwitchVerboseParam<TKind, TBranches, "output.schema.verbose">

export type { FormSwitchOutputVerbose }
