import type { Compute } from "~/tools/compute"

import type { ImpulseForm, ImpulseFormParams } from "../impulse-form"
import type { GetImpulseFormParam } from "../impulse-form"

import type { GetImpulseFormSwitchBranchesParam } from "./_get-impulse-form-switch-branches-para"
import type { ImpulseFormSwitchSchema } from "./_impulse-form-switch-schema"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchVerboseParam<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
  TKey extends keyof ImpulseFormParams,
> = Compute<
  ImpulseFormSwitchSchema<
    GetImpulseFormParam<TKind, TKey>,
    GetImpulseFormSwitchBranchesParam<TBranches, TKey>
  >
>
