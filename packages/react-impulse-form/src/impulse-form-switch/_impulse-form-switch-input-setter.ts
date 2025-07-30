import type { ImpulseForm } from "../impulse-form/impulse-form"
import type {
  ImpulseFormShape,
  ImpulseFormShapeInputSetter,
} from "../impulse-form-shape"

import type { ImpulseFormSwitchKindParams } from "./_impulse-form-switch-kind-params"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchInputSetter<
  TKind extends ImpulseForm<ImpulseFormSwitchKindParams<keyof TBranches>>,
  TBranches extends ImpulseFormSwitchBranches,
> = ImpulseFormShapeInputSetter<{
  active: TKind
  branches: ImpulseFormShape<TBranches>
}>
