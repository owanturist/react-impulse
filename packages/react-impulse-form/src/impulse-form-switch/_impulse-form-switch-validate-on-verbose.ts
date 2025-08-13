import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { ImpulseFormSwitchVerboseParam } from "./_impulse-form-switch-verbose-param"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchValidateOnVerbose<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> = ImpulseFormSwitchVerboseParam<TKind, TBranches, "validateOn.schema.verbose">
