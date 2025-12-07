import type { BaseImpulse } from "./base-impulse"
import type { Scope } from "./scope"

function createIsImpulse(isImpulse: (input: unknown) => input is BaseImpulse<unknown>) {
  return (
    ...[inputOrScope, maybeCheck, maybeInput]:
      | [input: unknown]
      | [scope: Scope, check: (input: unknown) => boolean, input: unknown]
  ): boolean => {
    if (!maybeCheck) {
      return isImpulse(inputOrScope)
    }

    if (isImpulse(maybeInput)) {
      const value = maybeInput.read(inputOrScope as Scope)

      return maybeCheck(value)
    }

    return false
  }
}

export { createIsImpulse }
