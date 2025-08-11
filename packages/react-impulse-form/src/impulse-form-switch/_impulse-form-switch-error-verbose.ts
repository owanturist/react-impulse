import type { GetImpulseFormSwitchParam } from "./_get-impulse-form-switch-branches-para"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchErrorVerbose<
  TBranches extends ImpulseFormSwitchBranches,
> = GetImpulseFormSwitchParam<TBranches, "error.schema.verbose">
