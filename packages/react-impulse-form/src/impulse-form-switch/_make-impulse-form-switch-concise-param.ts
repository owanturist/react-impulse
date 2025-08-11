import type { ImpulseForm, ImpulseFormParams } from "../impulse-form"

import type { MakeImpulseFormSwitchBranch } from "./_make-impulse-form-switch-branch"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type MakeImpulseFormSwitchConciseParam<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
  TKey extends keyof ImpulseFormParams,
  TConcise,
> =
  | TConcise
  | {
      readonly active: TConcise
      readonly branch: MakeImpulseFormSwitchBranch<TKind, TBranches, TKey>
    }
