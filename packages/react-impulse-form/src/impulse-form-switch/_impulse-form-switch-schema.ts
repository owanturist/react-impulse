import { isShallowObjectEqual } from "~/tools/is-shallow-object-equal"
import { isStrictEqual } from "~/tools/is-strict-equal"

import type { Compare, Scope } from "../dependencies"

export interface ImpulseFormSwitchSchema<TActive, TBranches> {
  readonly active: TActive
  readonly branches: TBranches
}

export function isShallowImpulseFormSwitchSchemaEqual<
  TSchema extends ImpulseFormSwitchSchema<unknown, Record<string, unknown>>,
>(left: TSchema, right: TSchema): boolean {
  return (
    isStrictEqual(left.active, right.active) &&
    isShallowObjectEqual(left.branches, right.branches)
  )
}

export function createImpulseFormSwitchSchemaCompare<TActive, TBranches>(
  isBranchesEqual: (left: TBranches, right: TBranches, scope: Scope) => boolean,
): Compare<ImpulseFormSwitchSchema<TActive, TBranches>> {
  return (left, right, scope) => {
    return (
      isStrictEqual(left.active, right.active) &&
      isBranchesEqual(left.branches, right.branches, scope)
    )
  }
}
