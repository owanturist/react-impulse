import type { Compute } from "~/tools/compute"

import type { ImpulseFormParams } from "../impulse-form"
import type { GetImpulseFormParam } from "../impulse-form"

import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type GetImpulseFormSwitchParam<
  TBranches extends ImpulseFormSwitchBranches,
  TKey extends keyof ImpulseFormParams,
> = Compute<{
  readonly [TBranch in keyof TBranches]: GetImpulseFormParam<
    TBranches[TBranch],
    TKey
  >
}>
