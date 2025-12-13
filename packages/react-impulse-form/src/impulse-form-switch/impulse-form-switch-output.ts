import type { SignalForm } from "../impulse-form/impulse-form"

import type { FormSwitchBranches } from "./impulse-form-switch-branches"
import type { FormSwitchBranchUnion } from "./_internal/impulse-form-switch-branch-union"

type FormSwitchOutput<
  TKind extends SignalForm,
  TBranches extends FormSwitchBranches<TKind>,
> = FormSwitchBranchUnion<TKind, TBranches, "output.schema">

export type { FormSwitchOutput }
