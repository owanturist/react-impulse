import type { ImpulseForm } from "../impulse-form/impulse-form"
import type { ImpulseFormShapeInput } from "../impulse-form-shape"

import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export { isShallowObjectEqual as isImpulseFormSwitchInputEqual } from "~/tools/is-shallow-object-equal"

export type ImpulseFormSwitchInput<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> = ImpulseFormShapeInput<{
  active: TKind
  branches: ImpulseFormShapeInput<TBranches>
}>
