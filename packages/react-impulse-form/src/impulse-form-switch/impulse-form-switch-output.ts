import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { ImpulseFormSwitchBranchUnion } from "./_impulse-form-switch-branch-union"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchOutput<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> = ImpulseFormSwitchBranchUnion<TKind, TBranches, "output.schema">
