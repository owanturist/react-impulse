import type { GetImpulseFormSwitchParam } from "./_get-impulse-form-switch-param"
import type { ImpulseFormSwitchCases } from "./impulse-form-switch-cases"

export type ImpulseFormSwitchFlagVerbose<
  TCases extends ImpulseFormSwitchCases,
> = GetImpulseFormSwitchParam<TCases, "flag.schema.verbose">
