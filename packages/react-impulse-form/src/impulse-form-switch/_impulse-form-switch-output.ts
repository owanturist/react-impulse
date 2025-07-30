import type { GetImpulseFormSwitchParam } from "./_get-impulse-form-switch-param"
import type { ImpulseFormSwitchCases } from "./impulse-form-switch-cases"

export type ImpulseFormSwitchOutput<TCases extends ImpulseFormSwitchCases> =
  GetImpulseFormSwitchParam<TCases, "output.schema">
