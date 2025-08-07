import type { GetImpulseFormSwitchParam } from "./_get-impulse-form-switch-branches-param"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchErrorVerbose<
  TBranches extends ImpulseFormSwitchBranches,
> = GetImpulseFormSwitchParam<TBranches, "error.schema.verbose">
