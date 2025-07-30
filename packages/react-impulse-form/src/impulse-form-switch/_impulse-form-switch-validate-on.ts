import type { ValidateStrategy } from "../validate-strategy"

import type { GetImpulseFormSwitchParam } from "./_get-impulse-form-switch-param"
import type { ImpulseFormSwitchCases } from "./impulse-form-switch-cases"

export type ImpulseFormSwitchValidateOn<TCases extends ImpulseFormSwitchCases> =
  ValidateStrategy | GetImpulseFormSwitchParam<TCases, "validateOn.schema">
