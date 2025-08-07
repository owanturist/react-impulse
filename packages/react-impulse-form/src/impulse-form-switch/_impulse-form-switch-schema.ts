import { isShallowObjectEqual } from "~/tools/is-shallow-object-equal"
import { isStrictEqual } from "~/tools/is-strict-equal"

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
