import type { ValidateStrategy } from "../validate-strategy"

import type { GetImpulseFormSwitchParam } from "./_get-impulse-form-switch-branches-param"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchValidateOn<
  TBranches extends ImpulseFormSwitchBranches,
> = ValidateStrategy | GetImpulseFormSwitchParam<TBranches, "validateOn.schema">
