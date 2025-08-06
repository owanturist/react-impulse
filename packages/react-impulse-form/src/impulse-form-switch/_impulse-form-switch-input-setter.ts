import type { ImpulseForm } from "../impulse-form/impulse-form"
import type {
  ImpulseFormShape,
  ImpulseFormShapeInputSetter,
} from "../impulse-form-shape"

import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchInputSetter<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> = ImpulseFormShapeInputSetter<{
  active: TKind
  branches: ImpulseFormShape<TBranches>
}>
