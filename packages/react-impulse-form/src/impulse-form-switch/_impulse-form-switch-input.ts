import type { ImpulseForm } from "../impulse-form/impulse-form"
import type { ImpulseFormShapeInput } from "../impulse-form-shape"

import type { ImpulseFormSwitchKindParams } from "./_impulse-form-switch-kind-params"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchInput<
  TKind extends ImpulseForm<ImpulseFormSwitchKindParams<keyof TBranches>>,
  TBranches extends ImpulseFormSwitchBranches,
> = ImpulseFormShapeInput<{
  active: TKind
  branches: ImpulseFormShapeInput<TBranches>
}>
