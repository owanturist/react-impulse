import type { Compute } from "~/tools/compute"

import type { GetImpulseFormParam } from "../../impulse-form/get-impulse-form-param"
import type { ImpulseForm } from "../../impulse-form/impulse-form"
import type { ImpulseFormParams } from "../../impulse-form/impulse-form-params"
import type { GetImpulseFormSwitchBranchesParam } from "../get-impulse-form-switch-branches-param"
import type { ImpulseFormSwitchBranches } from "../impulse-form-switch-branches"
import type { ImpulseFormSwitchVerboseSchema } from "../impulse-form-switch-verbose-schema"

type ImpulseFormSwitchVerboseParam<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
  TKey extends keyof ImpulseFormParams,
> = Compute<
  ImpulseFormSwitchVerboseSchema<
    GetImpulseFormParam<TKind, TKey>,
    GetImpulseFormSwitchBranchesParam<TBranches, TKey>
  >
>

export type { ImpulseFormSwitchVerboseParam }
