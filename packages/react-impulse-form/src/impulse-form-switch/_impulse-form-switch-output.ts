import { isNull } from "~/tools/is-null"

import { createUnionCompare } from "../create-union-compare"
import type { GetImpulseFormOutput } from "../impulse-form/get-impulse-form-output"
import type { GetImpulseFormParam } from "../impulse-form/get-impulse-form-param"
import type { ImpulseForm } from "../impulse-form/impulse-form"

import {
  type ImpulseFormSwitchBranch,
  isImpulseFormSwitchBranchEqual,
} from "./impulse-form-switch-branch"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchOutput<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> = {
  [TBranch in GetImpulseFormOutput<TKind>]: ImpulseFormSwitchBranch<
    TBranch,
    GetImpulseFormParam<TBranches[TBranch], "output.schema">
  >
}[GetImpulseFormOutput<TKind>]

export const isImpulseFormSwitchOutputEqual = createUnionCompare(
  isNull,
  isImpulseFormSwitchBranchEqual,
)
