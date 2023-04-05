import { useDebugValue, useMemo } from "react"
import { useSyncExternalStore } from "use-sync-external-store/shim/index.js"

import type { Impulse } from "./Impulse"
import { STATIC_SCOPE } from "./Scope"

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
      // does not need a real Scope - it subscribes by itself
      () => impulse.getValue(STATIC_SCOPE),
    ],
    [impulse],
  )
  const value = useSyncExternalStore(subscribe, getSnapshot)

  useDebugValue(value)

  return value
}
