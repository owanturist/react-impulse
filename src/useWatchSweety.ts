import { useCallback, useDebugValue } from "react"
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector.js"

import { useWatchContext } from "./useWatchContext"
import { Compare, isEqual, useEvent } from "./utils"

/**
 * A hook that executes the `watcher` function whenever any of the involved `Sweety` instances' state update
 * but enqueues a re-render only when the resulting value is different from the previous.
 *
 * @param watcher a function that subscribes to all `Sweety` instances calling the `Sweety#getState` method inside the function.
 * @param compare an optional `Compare` function. When not defined or `null` then `Object.is` applies as a fallback.
 */
export function useWatchSweety<T>(
  watcher: () => T,
  compare?: null | Compare<T>,
): T {
  const { executeWatcher, subscribe, getState } = useWatchContext({
    warningSource: "useWatchSweety",
  })

  // the select calls each time when updates either the watcher or the version
  const select = useCallback(
    () => executeWatcher(watcher),
    [executeWatcher, watcher],
  )

  // it should memoize the onCompare otherwise it will call the watcher on each render
  const onCompare = useEvent(compare ?? isEqual)

  const value = useSyncExternalStoreWithSelector(
    subscribe,
    getState,
    getState,
    select,
    onCompare,
  )

  useDebugValue(value)

  return value
}
