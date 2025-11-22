import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"
import type { ImpulseFormSwitchVerboseParam } from "./_internal/impulse-form-switch-verbose-param"

type ImpulseFormSwitchInput<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> = ImpulseFormSwitchVerboseParam<TKind, TBranches, "input.schema">

export type { ImpulseFormSwitchInput }
