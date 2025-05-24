import type { BaseImpulse } from "./base-impulse"
import type { Scope } from "./_Scope"

export function isImpulseFactory(
  isImpulse: (input: unknown) => input is BaseImpulse<unknown>,
) {
  return (
    ...[inputOrScope, maybeCheck, maybeInput]:
      | [input: unknown]
      | [scope: Scope, check: (input: unknown) => boolean, input: unknown]
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
