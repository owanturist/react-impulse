import type { GetImpulseFormOutput } from "../impulse-form/get-impulse-form-output"
import type { GetImpulseFormParam } from "../impulse-form/get-impulse-form-param"
import type { ImpulseForm } from "../impulse-form/impulse-form"
import type { ImpulseFormParams } from "../impulse-form/impulse-form-params"

import type { ImpulseFormSwitchBranch } from "./impulse-form-switch-branch"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type MakeImpulseFormSwitchBranch<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
  TKey extends keyof ImpulseFormParams,
> = {
  [TBranch in GetImpulseFormOutput<TKind>]: ImpulseFormSwitchBranch<
    TBranch,
    GetImpulseFormParam<TBranches[TBranch], TKey>
  >
}[GetImpulseFormOutput<TKind>]
