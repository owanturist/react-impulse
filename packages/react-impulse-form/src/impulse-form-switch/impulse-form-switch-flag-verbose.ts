import type { ImpulseForm } from "../impulse-form"

import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"
import type { ImpulseFormSwitchVerboseParam } from "./_internal/impulse-form-switch-verbose-param"

type ImpulseFormSwitchFlagVerbose<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> = ImpulseFormSwitchVerboseParam<TKind, TBranches, "flag.schema.verbose">

export type { ImpulseFormSwitchFlagVerbose }
