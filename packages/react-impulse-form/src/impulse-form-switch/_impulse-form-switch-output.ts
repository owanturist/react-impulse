import type { GetImpulseFormOutput } from "../impulse-form/get-impulse-form-output"
import type { GetImpulseFormParam } from "../impulse-form/get-impulse-form-param"
import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { ImpulseFormSwitchKindParams } from "./_impulse-form-switch-kind-params"
import type { ImpulseFormSwitchBranch } from "./impulse-form-switch-branch"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchOutput<
  TKind extends ImpulseForm<ImpulseFormSwitchKindParams<keyof TBranches>>,
  TBranches extends ImpulseFormSwitchBranches,
> = {
  [TBranch in Exclude<
    GetImpulseFormOutput<TKind>,
    null
  >]: ImpulseFormSwitchBranch<
    TBranch,
    GetImpulseFormParam<TBranches[TBranch], "output.schema">
  >
}[Exclude<GetImpulseFormOutput<TKind>, null>]
