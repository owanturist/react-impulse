import { useCallback, useDebugValue } from "react"
import { useSyncExternalStore } from "use-sync-external-store/shim/index.js"

import type { Impulse } from "./Sweety"
import { WatchContext } from "./WatchContext"

/**
 * A hook that subscribes to the `impulse` changes and returns the current value.
 *
 * @param impulse an Impulse instance.
 *
 * @version 1.0.0
 */
export function useImpulseValue<T>(impulse: Impulse<T>): T {
  const value = useSyncExternalStore(
    useCallback((onChange) => impulse.subscribe(onChange), [impulse]),
    useCallback(() => WatchContext.ignore(() => impulse.getValue()), [impulse]),
  )

  useDebugValue(value)

  return value
}
