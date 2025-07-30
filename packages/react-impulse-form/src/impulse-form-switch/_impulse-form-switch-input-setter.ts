import type { Setter } from "~/tools/setter"

import type { GetImpulseFormSwitchParam } from "./_get-impulse-form-switch-param"
import type { ImpulseFormSwitchInput } from "./_impulse-form-switch-input"
import type { ImpulseFormSwitchCases } from "./impulse-form-switch-cases"

export type ImpulseFormSwitchInputSetter<
  TCases extends ImpulseFormSwitchCases,
> = Setter<
  Partial<GetImpulseFormSwitchParam<TCases, "input.setter">>,
  [ImpulseFormSwitchInput<TCases>, ImpulseFormSwitchInput<TCases>]
>
