import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"
import type { ImpulseFormSwitchBranchUnion } from "./_internal/impulse-form-switch-branch-union"

type ImpulseFormSwitchOutput<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> = ImpulseFormSwitchBranchUnion<TKind, TBranches, "output.schema">

export type { ImpulseFormSwitchOutput }
