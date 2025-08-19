import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { ImpulseFormSwitchBranch } from "./impulse-form-switch-branch"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchActiveBranch<
  TBranches extends ImpulseFormSwitchBranches<ImpulseForm>,
> = {
  [TBranch in keyof TBranches]: ImpulseFormSwitchBranch<
    TBranch,
    TBranches[TBranch]
  >
}[keyof TBranches]
