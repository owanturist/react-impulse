import type { Setter } from "~/tools/setter"

import type { GetImpulseFormSwitchParam } from "./_get-impulse-form-switch-branches-param"
import type { ImpulseFormSwitchFlagVerbose } from "./_impulse-form-switch-flag-verbose"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchFlagSetter<
  TBranches extends ImpulseFormSwitchBranches,
> = Setter<
  boolean | Partial<GetImpulseFormSwitchParam<TBranches, "flag.setter">>,
  [ImpulseFormSwitchFlagVerbose<TBranches>]
>
