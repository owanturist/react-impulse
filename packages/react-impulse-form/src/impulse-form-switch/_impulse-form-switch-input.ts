import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { GetImpulseFormSwitchParams } from "./_get-impulse-form-switch-params"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export { isShallowImpulseFormSwitchSchemaEqual as isImpulseFormSwitchInputEqual } from "./_impulse-form-switch-schema"

export type ImpulseFormSwitchInput<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> = GetImpulseFormSwitchParams<TKind, TBranches, "input.schema">
