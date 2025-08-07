import type { Compute } from "~/tools/compute"

import type { ImpulseForm, ImpulseFormParams } from "../impulse-form"
import type { GetImpulseFormParam } from "../impulse-form"

import type { GetImpulseFormSwitchBranchesParams } from "./_get-impulse-form-switch-branches-param"
import type { ImpulseFormSwitchSchema } from "./_impulse-form-switch-schema"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type GetImpulseFormSwitchParams<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
  TKey extends keyof ImpulseFormParams,
  TConcise = never,
> =
  | TConcise
  | Compute<
      ImpulseFormSwitchSchema<
        GetImpulseFormParam<TKind, TKey>,
        TConcise | GetImpulseFormSwitchBranchesParams<TBranches, TKey>
      >
    >
