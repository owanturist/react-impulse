import type { BaseSignal } from "./base-signal"
import type { Monitor } from "./monitor"

function createIsSignal(isSignal: (input: unknown) => input is BaseSignal<unknown>) {
  return (
    ...[inputOrMonitor, maybeCheck, maybeInput]:
      | [input: unknown]
      | [monitor: Monitor, check: (input: unknown) => boolean, input: unknown]
  ): boolean => {
    if (!maybeCheck) {
      return isSignal(inputOrMonitor)
    }

    if (isSignal(maybeInput)) {
      const value = maybeInput.read(inputOrMonitor as Monitor)

      return maybeCheck(value)
    }

    return false
  }
}

export { createIsSignal }
