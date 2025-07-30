import type { GetImpulseFormSwitchParam } from "./_get-impulse-form-switch-param"
import type { ImpulseFormSwitchCases } from "./impulse-form-switch-cases"

export type ImpulseFormSwitchError<TCases extends ImpulseFormSwitchCases> =
  null | GetImpulseFormSwitchParam<TCases, "error.schema">
