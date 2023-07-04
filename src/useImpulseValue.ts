import { useCallback, useDebugValue } from "react"

import type { Impulse } from "./Impulse"
import { useScope } from "./useScope"
import { Scope, injectScope } from "./Scope"

/**
 * A hook that subscribes to the `impulse` changes and returns the current value.
 *
 * @param impulse an Impulse instance.
 *
 * @version 1.0.0
 */
export function useImpulseValue<T>(impulse: Impulse<T>): T {
  const transform = useCallback(
    (scope: Scope) => injectScope(scope, () => impulse.getValue()),
    [impulse],
  )
  const value = useScope(transform, impulse.compare)

  useDebugValue(value)

  return value
}
