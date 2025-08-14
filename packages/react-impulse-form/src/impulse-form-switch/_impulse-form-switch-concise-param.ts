import type {
  GetImpulseFormParam,
  ImpulseForm,
  ImpulseFormParams,
} from "../impulse-form"

import type { ImpulseFormSwitchBranchUnion } from "./_impulse-form-switch-branch-union"
import type { ImpulseFormSwitchConciseSchema } from "./_impulse-form-switch-concise-schema"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchConciseParam<
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
