import type { ImpulseForm } from "../impulse-form"

import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"
import type { ImpulseFormSwitchConciseParam } from "./_internal/impulse-form-switch-concise-param"

type ImpulseFormSwitchError<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> = ImpulseFormSwitchConciseParam<TKind, TBranches, "error.schema", null>

export type { ImpulseFormSwitchError }
