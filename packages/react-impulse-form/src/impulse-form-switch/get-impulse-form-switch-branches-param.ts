import type { Compute } from "~/tools/compute"

import type { GetImpulseFormParam, ImpulseForm, ImpulseFormParams } from "../impulse-form"

import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

type GetImpulseFormSwitchBranchesParam<
  TBranches extends ImpulseFormSwitchBranches<ImpulseForm>,
  TKey extends keyof ImpulseFormParams,
> = Compute<{
  readonly [TBranch in keyof TBranches]: GetImpulseFormParam<TBranches[TBranch], TKey>
}>

export type { GetImpulseFormSwitchBranchesParam }
