import type { Compute } from "~/tools/compute"
import type { GetImpulseFormParam, ImpulseForm, ImpulseFormParams } from "../impulse-form"

import type { GetImpulseFormSwitchBranchesParam } from "./_get-impulse-form-switch-branches-param"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"
import type { ImpulseFormSwitchVerboseSchema } from "./impulse-form-switch-verbose-schema"

export type ImpulseFormSwitchVerboseParam<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
  TKey extends keyof ImpulseFormParams,
> = Compute<
  ImpulseFormSwitchVerboseSchema<
    GetImpulseFormParam<TKind, TKey>,
    GetImpulseFormSwitchBranchesParam<TBranches, TKey>
  >
>
