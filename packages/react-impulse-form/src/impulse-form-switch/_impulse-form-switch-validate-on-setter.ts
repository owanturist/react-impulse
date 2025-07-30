import type { Setter } from "~/tools/setter"

import type { ValidateStrategy } from "../validate-strategy"

import type { GetImpulseFormSwitchParam } from "./_get-impulse-form-switch-param"
import type { ImpulseFormSwitchValidateOnVerbose } from "./_impulse-form-switch-validate-on-verbose"
import type { ImpulseFormSwitchCases } from "./impulse-form-switch-cases"

export type ImpulseFormSwitchValidateOnSetter<
  TCases extends ImpulseFormSwitchCases,
> = Setter<
  | ValidateStrategy
  | Partial<GetImpulseFormSwitchParam<TCases, "validateOn.setter">>,
  [ImpulseFormSwitchValidateOnVerbose<TCases>]
>
