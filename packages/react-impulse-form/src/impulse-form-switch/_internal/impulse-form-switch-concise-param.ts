import type { GetImpulseFormParam, ImpulseForm, ImpulseFormParams } from "../../impulse-form"
import type { ImpulseFormSwitchBranches } from "../impulse-form-switch-branches"
import type { ImpulseFormSwitchConciseSchema } from "../impulse-form-switch-concise-schema"

import type { ImpulseFormSwitchBranchUnion } from "./impulse-form-switch-branch-union"

type ImpulseFormSwitchConciseParam<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
  TKey extends keyof ImpulseFormParams,
  TConcise,
> =
  | TConcise
  | ImpulseFormSwitchConciseSchema<
      TConcise | GetImpulseFormParam<TKind, TKey>,
      TConcise | ImpulseFormSwitchBranchUnion<TKind, TBranches, TKey>
    >

export type { ImpulseFormSwitchConciseParam }
