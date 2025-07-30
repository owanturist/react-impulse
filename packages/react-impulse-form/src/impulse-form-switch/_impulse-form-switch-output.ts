import type { GetImpulseFormParam } from "../impulse-form/get-impulse-form-param"

import type { ImpulseFormSwitchBranch } from "./impulse-form-switch-branch"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchOutput<
  TBranches extends ImpulseFormSwitchBranches,
> = {
  [TBranch in keyof TBranches]: ImpulseFormSwitchBranch<
    TBranch,
    GetImpulseFormParam<TBranches[TBranch], "output.schema">
  >
}[keyof TBranches]
