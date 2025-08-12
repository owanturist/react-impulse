import { isStrictEqual } from "~/tools/is-strict-equal"

import type { Compare, Scope } from "../dependencies"

export interface ImpulseFormSwitchVerboseSchema<TActive, TBranches> {
  readonly active: TActive
  readonly branches: TBranches
}

export function createImpulseFormSwitchVerboseSchemaCompare<TActive, TBranches>(
  isBranchesEqual: (left: TBranches, right: TBranches, scope: Scope) => boolean,
): Compare<ImpulseFormSwitchVerboseSchema<TActive, TBranches>> {
  return (left, right, scope) => {
    return (
      isStrictEqual(left.active, right.active) &&
      isBranchesEqual(left.branches, right.branches, scope)
    )
  }
}
