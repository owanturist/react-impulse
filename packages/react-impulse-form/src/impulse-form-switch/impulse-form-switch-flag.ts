import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"
import type { ImpulseFormSwitchConciseParam } from "./_internal/impulse-form-switch-concise-param"

type ImpulseFormSwitchFlag<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> = ImpulseFormSwitchConciseParam<TKind, TBranches, "flag.schema", boolean>

export type { ImpulseFormSwitchFlag }
