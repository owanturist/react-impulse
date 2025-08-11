import { isBoolean } from "~/tools/is-boolean"
import { isStrictEqual } from "~/tools/is-strict-equal"

import { createUnionCompare } from "../create-union-compare"
import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { MakeImpulseFormSwitchConciseParam } from "./_make-impulse-form-switch-concise-param"
import { isImpulseFormSwitchBranchEqual } from "./impulse-form-switch-branch"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchFlag<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> = MakeImpulseFormSwitchConciseParam<TKind, TBranches, "flag.schema", boolean>

export const isImpulseFormSwitchFlagEqual = createUnionCompare(
  isBoolean,
  <
    TKind extends ImpulseForm,
    TBranches extends ImpulseFormSwitchBranches<TKind>,
  >(
    left: Exclude<ImpulseFormSwitchFlag<TKind, TBranches>, boolean>,
    right: Exclude<ImpulseFormSwitchFlag<TKind, TBranches>, boolean>,
  ) => {
    return (
      isStrictEqual(left.active, right.active) &&
      isImpulseFormSwitchBranchEqual(left.branch, right.branch)
    )
  },
)
