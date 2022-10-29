import { useCallback, useDebugValue } from "react"
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector.js"

import { useWatchContext } from "./useWatchContext"
import { Compare, isEqual, useEvent } from "./utils"

/**
 * A hook that subscribes to all `Sweety#getState` execution involved in the `watcher` call.
 * Due to the mutable nature of `Sweety` instances a parent component won't be re-rendered when a child's `Sweety` value is changed.
 * The hook gives a way to watch after deep changes in the store's values and trigger a re-render when the returning value changes.
 *
 * @param watcher a function to read only the watching value meaning that it never should call `Sweety.of`, `Sweety#clone`, `Sweety#setState` or `Sweety#subscribe` methods inside.
 * @param compare an optional compare function.
 * The strict equality check function (`===`) will be used if `null` or not defined.
 */
export function useWatchSweety<T>(
  watcher: () => T,
  compare?: null | Compare<T>,
): T {
  const { context, subscribe, getState } = useWatchContext()

  // the select calls each time when updates either the watcher or the version
  const select = useCallback(
    () => context.watchStores(watcher),
    [context, watcher],
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
