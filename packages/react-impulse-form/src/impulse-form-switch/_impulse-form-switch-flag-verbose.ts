import type { GetImpulseFormSwitchParam } from "./_get-impulse-form-switch-branches-param"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchFlagVerbose<
  TBranches extends ImpulseFormSwitchBranches,
> = GetImpulseFormSwitchParam<TBranches, "flag.schema.verbose">
