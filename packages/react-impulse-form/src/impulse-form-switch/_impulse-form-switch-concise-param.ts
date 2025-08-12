import type { ImpulseForm, ImpulseFormParams } from "../impulse-form"

import type { ImpulseFormSwitchBranchUnion } from "./_impulse-form-switch-branch-union"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchConciseParam<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
  TKey extends keyof ImpulseFormParams,
  TConcise,
> =
  | TConcise
  | {
      readonly active: TConcise
      readonly branch: ImpulseFormSwitchBranchUnion<TKind, TBranches, TKey>
    }
