import type { Setter } from "~/tools/setter"

import type { GetImpulseFormSwitchParam } from "./_get-impulse-form-switch-param"
import type { ImpulseFormSwitchErrorVerbose } from "./_impulse-form-switch-error-verbose"
import type { ImpulseFormSwitchCases } from "./impulse-form-switch-cases"

export type ImpulseFormSwitchErrorSetter<
  TCases extends ImpulseFormSwitchCases,
> = Setter<
  null | Partial<GetImpulseFormSwitchParam<TCases, "error.setter">>,
  [ImpulseFormSwitchErrorVerbose<TCases>]
>
