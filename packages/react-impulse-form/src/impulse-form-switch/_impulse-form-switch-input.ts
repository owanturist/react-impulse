import { isShallowObjectEqual } from "~/tools/is-shallow-object-equal"
import { isStrictEqual } from "~/tools/is-strict-equal"

import type { GetImpulseFormParam } from "../impulse-form/get-impulse-form-param"
import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { GetImpulseFormSwitchBranchesParam } from "./_get-impulse-form-switch-branches-param"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchBranchesInput<
  TBranches extends ImpulseFormSwitchBranches,
> = GetImpulseFormSwitchBranchesParam<TBranches, "input.schema">

export interface ImpulseFormSwitchInput<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> {
  readonly active: GetImpulseFormParam<TKind, "input.schema">
  readonly branches: ImpulseFormSwitchBranchesInput<TBranches>
}

export function isImpulseFormSwitchInputEqual<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
>(
  left: ImpulseFormSwitchInput<TKind, TBranches>,
  right: ImpulseFormSwitchInput<TKind, TBranches>,
): boolean {
  return (
    isStrictEqual(left.active, right.active) &&
    isShallowObjectEqual(left.branches, right.branches)
  )
}
