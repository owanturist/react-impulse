import { useDebugValue } from "react"

import type { Impulse } from "./Impulse"
import { useScope } from "./useScope"

/**
 * A hook that subscribes to the `impulse` changes and returns the current value.
 *
 * @param impulse an Impulse instance.
 *
 * @version 1.0.0
 */
export function useImpulseValue<T>(impulse: Impulse<T>): T {
  const scope = useScope()
  const value = impulse.getValue(scope)

  useDebugValue(value)

  return value
}
