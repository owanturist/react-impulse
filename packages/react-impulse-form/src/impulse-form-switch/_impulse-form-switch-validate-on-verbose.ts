import type { GetImpulseFormSwitchParam } from "./_get-impulse-form-switch-param"
import type { ImpulseFormSwitchCases } from "./impulse-form-switch-cases"

export type ImpulseFormSwitchValidateOnVerbose<
  TCases extends ImpulseFormSwitchCases,
> = GetImpulseFormSwitchParam<TCases, "validateOn.schema.verbose">
