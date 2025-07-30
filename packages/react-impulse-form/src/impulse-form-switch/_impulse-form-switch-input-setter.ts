import type { Setter } from "~/tools/setter"

import type { GetImpulseFormSwitchParam } from "./_get-impulse-form-switch-param"
import type { ImpulseFormSwitchInput } from "./_impulse-form-switch-input"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchInputSetter<
  TBranches extends ImpulseFormSwitchBranches,
> = Setter<
  Partial<GetImpulseFormSwitchParam<TBranches, "input.setter">>,
  [ImpulseFormSwitchInput<TBranches>, ImpulseFormSwitchInput<TBranches>]
>
