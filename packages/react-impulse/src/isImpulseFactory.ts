import type { BaseImpulse } from "./BaseImpulse"
import type { Scope } from "./Scope"
import type { Func } from "./utils"

export function isImpulseFactory(
  isImpulse: (input: unknown) => input is BaseImpulse<unknown>,
) {
  return (
    ...[inputOrScope, maybeCheck, maybeInput]:
      | [input: unknown]
      | [scope: Scope, check: Func<[unknown], boolean>, input: unknown]
  ) => {
    if (!maybeCheck) {
      return isImpulse(inputOrScope)
    }

    if (isImpulse(maybeInput)) {
      const value = maybeInput.getValue(inputOrScope as Scope)

      return maybeCheck(value)
    }

    return false
  }
}
