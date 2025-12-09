import type { SignalForm } from "../signal-form/signal-form"

import type { FormSwitchBranches } from "./form-switch-branches"
import type { FormSwitchVerboseParam } from "./_internal/form-switch-verbose-param"

type FormSwitchValidateOnVerbose<
  TKind extends SignalForm,
  TBranches extends FormSwitchBranches<TKind>,
> = FormSwitchVerboseParam<TKind, TBranches, "validateOn.schema.verbose">

export type { FormSwitchValidateOnVerbose }
