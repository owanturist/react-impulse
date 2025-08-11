import type { GetImpulseFormSwitchParam } from "./_get-impulse-form-switch-branches-para"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchValidateOnVerbose<
  TBranches extends ImpulseFormSwitchBranches,
> = GetImpulseFormSwitchParam<TBranches, "validateOn.schema.verbose">
