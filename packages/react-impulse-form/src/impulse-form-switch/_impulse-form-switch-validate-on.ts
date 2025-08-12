import { isStrictEqual } from "~/tools/is-strict-equal"
import { isString } from "~/tools/is-string"

import { createUnionCompare } from "../create-union-compare"
import type { ImpulseForm } from "../impulse-form/impulse-form"
import type { ValidateStrategy } from "../validate-strategy"

import type { ImpulseFormSwitchConciseParam } from "./_impulse-form-switch-concise-param"
import { isImpulseFormSwitchBranchEqual } from "./impulse-form-switch-branch"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchValidateOn<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> = ImpulseFormSwitchConciseParam<
  TKind,
  TBranches,
  "validateOn.schema",
  ValidateStrategy
>

export const isImpulseFormSwitchValidateOnEqual = createUnionCompare(
  isString,
  <
    TKind extends ImpulseForm,
    TBranches extends ImpulseFormSwitchBranches<TKind>,
  >(
    left: Exclude<ImpulseFormSwitchValidateOn<TKind, TBranches>, string>,
    right: Exclude<ImpulseFormSwitchValidateOn<TKind, TBranches>, string>,
  ) => {
    return (
      isStrictEqual(left.active, right.active) &&
      isImpulseFormSwitchBranchEqual(left.branch, right.branch)
    )
  },
)
