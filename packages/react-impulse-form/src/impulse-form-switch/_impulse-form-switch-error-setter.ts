import type { Setter } from "~/tools/setter"

import type { GetImpulseFormSwitchParam } from "./_get-impulse-form-switch-param"
import type { ImpulseFormSwitchErrorVerbose } from "./_impulse-form-switch-error-verbose"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchErrorSetter<
  TBranches extends ImpulseFormSwitchBranches,
> = Setter<
  null | Partial<GetImpulseFormSwitchParam<TBranches, "error.setter">>,
  [ImpulseFormSwitchErrorVerbose<TBranches>]
>
