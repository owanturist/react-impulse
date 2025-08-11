import type { Setter } from "~/tools/setter"

import type { ValidateStrategy } from "../validate-strategy"

import type { GetImpulseFormSwitchParam } from "./_get-impulse-form-switch-branches-para"
import type { ImpulseFormSwitchValidateOnVerbose } from "./_impulse-form-switch-validate-on-verbose"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchValidateOnSetter<
  TBranches extends ImpulseFormSwitchBranches,
> = Setter<
  | ValidateStrategy
  | Partial<GetImpulseFormSwitchParam<TBranches, "validateOn.setter">>,
  [ImpulseFormSwitchValidateOnVerbose<TBranches>]
>
