import type { ImpulseForm } from "../impulse-form/impulse-form"
import type { ValidateStrategy } from "../validate-strategy"

import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"
import type { ImpulseFormSwitchConciseParam } from "./_internal/impulse-form-switch-concise-param"

type ImpulseFormSwitchValidateOn<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> = ImpulseFormSwitchConciseParam<TKind, TBranches, "validateOn.schema", ValidateStrategy>

export type { ImpulseFormSwitchValidateOn }
