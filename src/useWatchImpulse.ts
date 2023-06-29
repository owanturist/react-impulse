import { useCallback, useDebugValue } from "react"
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector.js"

import { useWatchContext } from "./useWatchContext"
import { Compare, eq, useEvent } from "./utils"

/**
 * A hook that executes the `watcher` function whenever any of the involved Impulses' values update
 * but enqueues a re-render only when the resulting value is different from the previous.
 *
 * @param watcher a function that subscribes to all Impulses calling the `Impulse#getValue` method inside the function.
 * @param compare an optional `Compare` function. When not defined or `null` then `Object.is` applies as a fallback.
 *
 * @version 1.0.0
 */
export function useWatchImpulse<T>(
  watcher: () => T,
  compare?: null | Compare<T>,
): T {
  const { executeWatcher, subscribe, getVersion } = useWatchContext({
    warningSource: "useWatchImpulse",
  })

  // the select calls each time when updates either the watcher or the version
  const select = useCallback(
    () => executeWatcher(watcher),
    [executeWatcher, watcher],
  )

  const value = useSyncExternalStoreWithSelector(
    subscribe,
    getVersion,
    getVersion,
    select,
    useEvent(compare ?? eq),
  )

  useDebugValue(value)

  return value
}
