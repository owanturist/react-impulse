import type { ImpulseForm } from "../impulse-form/impulse-form"
import type { ImpulseFormShapeOutputVerbose } from "../impulse-form-shape"

import type { ImpulseFormSwitchKindParams } from "./_impulse-form-switch-kind-params"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchOutputVerbose<
  TKind extends ImpulseForm<ImpulseFormSwitchKindParams<keyof TBranches>>,
  TBranches extends ImpulseFormSwitchBranches,
> = ImpulseFormShapeOutputVerbose<{
  active: TKind
  branches: ImpulseFormShapeOutputVerbose<TBranches>
}>
