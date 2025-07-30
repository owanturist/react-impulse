import type { GetImpulseFormSwitchParam } from "./_get-impulse-form-switch-param"
import type { ImpulseFormSwitchCases } from "./impulse-form-switch-cases"

export type ImpulseFormSwitchInput<TCases extends ImpulseFormSwitchCases> =
  GetImpulseFormSwitchParam<TCases, "input.schema">
