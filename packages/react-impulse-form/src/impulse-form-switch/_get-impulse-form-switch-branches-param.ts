import type { Compute } from "~/tools/compute"

import type { ImpulseForm, ImpulseFormParams } from "../impulse-form"
import type { GetImpulseFormParam } from "../impulse-form"

import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type GetImpulseFormSwitchBranchesParams<
  TBranches extends ImpulseFormSwitchBranches<ImpulseForm>,
  TKey extends keyof ImpulseFormParams,
> = Compute<{
  readonly [TBranch in keyof TBranches]: GetImpulseFormParam<
    TBranches[TBranch],
    TKey
  >
}>
