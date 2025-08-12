import { isNull } from "~/tools/is-null"

import { createUnionCompare } from "../create-union-compare"
import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { ImpulseFormSwitchBranchUnion } from "./_impulse-form-switch-branch-union"
import { isImpulseFormSwitchBranchEqual } from "./impulse-form-switch-branch"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchOutput<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> = ImpulseFormSwitchBranchUnion<TKind, TBranches, "output.schema">

export const isImpulseFormSwitchOutputEqual = createUnionCompare(
  isNull,
  isImpulseFormSwitchBranchEqual,
)
