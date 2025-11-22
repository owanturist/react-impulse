import type { Compute } from "~/tools/compute"

import type { GetImpulseFormParam } from "../impulse-form/get-impulse-form-param"
import type { ImpulseForm } from "../impulse-form/impulse-form"
import type { ImpulseFormParams } from "../impulse-form/impulse-form-params"

import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

type GetImpulseFormSwitchBranchesParam<
  TBranches extends ImpulseFormSwitchBranches<ImpulseForm>,
  TKey extends keyof ImpulseFormParams,
> = Compute<{
  readonly [TBranch in keyof TBranches]: GetImpulseFormParam<TBranches[TBranch], TKey>
}>

export type { GetImpulseFormSwitchBranchesParam }
