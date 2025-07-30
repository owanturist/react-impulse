import type { GetImpulseFormSwitchParam } from "./_get-impulse-form-switch-param"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchOutputVerbose<
  TBranches extends ImpulseFormSwitchBranches,
> = GetImpulseFormSwitchParam<TBranches, "output.schema.verbose">
