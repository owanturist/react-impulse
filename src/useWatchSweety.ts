import { useRef, useEffect, useCallback, useDebugValue } from "react"
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector.js"

import { useEvent } from "./useEvent"
import { Compare, isEqual } from "./utils"
import { WatchContext } from "./WatchContext"

const modInc = (x: number): number => {
  return (x + 1) % 123456789
}

/**
 * A hook that subscribes to all `Sweety#getState` execution involved in the `watcher` call.
 * Due to the mutable nature of `Sweety` instances a parent component won't be re-rendered when a child's `Sweety` value is changed.
 * The hook gives a way to watch after deep changes in the store's values and trigger a re-render when the returning value changes.
 *
 * @param watcher a function to read only the watching value meaning that it never should call `Sweety.of`, `Sweety#clone`, `Sweety#setState` or `Sweety#subscribe` methods inside.
 * @param compare an optional compare function.
 * The strict equality check function (`===`) will be used if `null` or not defined.
 *
 * @see {@link Sweety.getState}
 * @see {@link Compare}
 */
export function useWatchSweety<T>(
  watcher: () => T,
  compare?: null | Compare<T>,
): T {
  const forceSelectRef = useRef(0)
  const contextRef = useRef<WatchContext>()

  if (contextRef.current == null) {
    contextRef.current = new WatchContext()
  }

  // the subscribe cannot directly return the watcher result
  // because it might be different per each call
  // but subscribe requires a snapshot of the mutable store
  // so instead it increments the forceSelectRef on store updates only
  // but keeps the value in between allowing to avoid the re-render hell
  const subscribe = useCallback((onStoreChange: VoidFunction) => {
    return contextRef.current!.subscribeOnWatchedStores(() => {
      forceSelectRef.current = modInc(forceSelectRef.current)
      onStoreChange()
    })
  }, [])
  const getState = useCallback(() => forceSelectRef.current, [])
  // the select calls each time when updates either the watcher or the forceSelectRef
  const select = useCallback(
    () => WatchContext.executeWatcher(watcher),
    [watcher],
  )
  // it should memoize the onCompare otherwise it will call the watcher on each render
  const onCompare = useEvent(compare ?? isEqual)

  useEffect(() => {
    contextRef.current!.watchStores(watcher)
  }, [watcher])

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
