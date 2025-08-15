import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"
import type { ImpulseFormSwitchVerboseParam } from "./impulse-form-switch-verbose-param"

export type ImpulseFormSwitchFlagVerbose<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> = ImpulseFormSwitchVerboseParam<TKind, TBranches, "flag.schema.verbose">
