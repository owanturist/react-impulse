import type { SignalForm } from "../signal-form/signal-form"

import type { FormSwitchBranches } from "./form-switch-branches"
import type { FormSwitchBranchUnion } from "./_internal/form-switch-branch-union"

type FormSwitchOutput<
  TKind extends SignalForm,
  TBranches extends FormSwitchBranches<TKind>,
> = FormSwitchBranchUnion<TKind, TBranches, "output.schema">

export type { FormSwitchOutput }
