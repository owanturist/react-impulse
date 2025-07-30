import type { GetImpulseFormSwitchParam } from "./_get-impulse-form-switch-param"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchError<
  TBranches extends ImpulseFormSwitchBranches,
> = null | GetImpulseFormSwitchParam<TBranches, "error.schema">
