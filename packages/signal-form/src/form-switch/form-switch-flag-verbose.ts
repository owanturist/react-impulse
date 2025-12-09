import type { SignalForm } from "../signal-form/signal-form"

import type { FormSwitchBranches } from "./form-switch-branches"
import type { FormSwitchVerboseParam } from "./_internal/form-switch-verbose-param"

type FormSwitchFlagVerbose<
  TKind extends SignalForm,
  TBranches extends FormSwitchBranches<TKind>,
> = FormSwitchVerboseParam<TKind, TBranches, "flag.schema.verbose">

export type { FormSwitchFlagVerbose }
