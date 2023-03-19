import { useDebugValue, useMemo } from "react"
import { useSyncExternalStore } from "use-sync-external-store/shim/index.js"

import type { Impulse } from "./Impulse"
import { WatchContext } from "./WatchContext"

/**
 * A hook that subscribes to the `impulse` changes and returns the current value.
 *
 * @param impulse an Impulse instance.
 *
 * @version 1.0.0
 */
export function useImpulseValue<T>(impulse: Impulse<T>): T {
  const [subscribe, getSnapshot] = useMemo(
    () => [
      (onChange: VoidFunction) => impulse.subscribe(onChange),
      () => WatchContext.ignore(() => impulse.getValue()),
    ],
    [impulse],
  )
  const value = useSyncExternalStore(subscribe, getSnapshot)

  useDebugValue(value)

  return value
}
