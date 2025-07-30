import type { Setter } from "~/tools/setter"

import type { GetImpulseFormSwitchParam } from "./_get-impulse-form-switch-param"
import type { ImpulseFormSwitchFlagVerbose } from "./_impulse-form-switch-flag-verbose"
import type { ImpulseFormSwitchCases } from "./impulse-form-switch-cases"

export type ImpulseFormSwitchFlagSetter<TCases extends ImpulseFormSwitchCases> =
  Setter<
    boolean | Partial<GetImpulseFormSwitchParam<TCases, "flag.setter">>,
    [ImpulseFormSwitchFlagVerbose<TCases>]
  >
