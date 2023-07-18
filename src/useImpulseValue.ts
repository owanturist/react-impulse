import { useCallback, useDebugValue } from "./dependencies"
import type { Impulse } from "./Impulse"
import { useWatchImpulse } from "./useWatchImpulse"

/**
 * A hook that subscribes to the `impulse` changes and returns the current value.
 *
 * @param impulse an Impulse instance.
 *
 * @version 1.0.0
 */
export function useImpulseValue<T>(impulse: Impulse<T>): T {
  const watcher = useCallback(() => impulse.getValue(), [impulse])
  const value = useWatchImpulse(watcher, impulse.compare)

  useDebugValue(value)

  return value
}
