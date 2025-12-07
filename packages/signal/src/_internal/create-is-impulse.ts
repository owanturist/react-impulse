import type { BaseImpulse } from "./base-impulse"
import type { Monitor } from "./monitor"

function createIsImpulse(isImpulse: (input: unknown) => input is BaseImpulse<unknown>) {
  return (
    ...[inputOrMonitor, maybeCheck, maybeInput]:
      | [input: unknown]
      | [monitor: Monitor, check: (input: unknown) => boolean, input: unknown]
  ): boolean => {
    if (!maybeCheck) {
      return isImpulse(inputOrMonitor)
    }

    if (isImpulse(maybeInput)) {
      const value = maybeInput.read(inputOrMonitor as Monitor)

      return maybeCheck(value)
    }

    return false
  }
}

export { createIsImpulse }
