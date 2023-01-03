import { useCallback, useDebugValue } from "react"
import { useSyncExternalStore } from "use-sync-external-store/shim/index.js"

import type { Impulse } from "./Impulse"
import { WatchContext } from "./WatchContext"

/**
 * A hook that subscribes to the `impulse` changes and returns the current state.
 *
 * @param impulse an Impulse instance.
 *
 * @version 1.0.0
 */
export function useImpulseState<T>(impulse: Impulse<T>): T {
  const state = useSyncExternalStore(
    useCallback((onChange) => impulse.subscribe(onChange), [impulse]),
    useCallback(() => WatchContext.ignore(() => impulse.getState()), [impulse]),
  )

  useDebugValue(state)

  return state
}
