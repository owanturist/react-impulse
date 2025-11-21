import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { ImpulseFormSwitchConciseParam } from "./_impulse-form-switch-concise-param"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchError<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> = ImpulseFormSwitchConciseParam<TKind, TBranches, "error.schema", null>
