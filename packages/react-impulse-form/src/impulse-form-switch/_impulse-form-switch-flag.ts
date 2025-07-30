import type { GetImpulseFormSwitchParam } from "./_get-impulse-form-switch-param"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchFlag<TBranches extends ImpulseFormSwitchBranches> =
  boolean | GetImpulseFormSwitchParam<TBranches, "flag.schema">
