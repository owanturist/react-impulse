import type { GetImpulseFormSwitchParam } from "./_get-impulse-form-switch-param"
import type { ImpulseFormSwitchCases } from "./impulse-form-switch-cases"

export type ImpulseFormSwitchFlag<TCases extends ImpulseFormSwitchCases> =
  | boolean
  | GetImpulseFormSwitchParam<TCases, "flag.schema">
