import { useRef, useCallback, useDebugValue } from "react"
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector.js"

import { Compare, isEqual, useEvent } from "./utils"
import { WatchContext } from "./WatchContext"

const modInc = (x: number): number => {
  return (x + 1) % 10e10
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
  const watcherUpdateVersionRef = useRef(0)
  const contextRef = useRef<WatchContext>()
  const subscribeRef = useRef<(onStoreChange: VoidFunction) => VoidFunction>()
  const onStoreChangeRef = useRef<null | VoidFunction>(null)

  if (contextRef.current == null) {
    contextRef.current = new WatchContext()
  }

  const watcherRef = useRef<() => T>()

  // run the watcher synchronously so it fills up the subscribers of the stores
  if (watcherRef.current !== watcher) {
    watcherRef.current = watcher
    contextRef.current.watchStores(watcher)
  }

  // it should subscribe the WatchContext during render otherwise
  // it might lead to race conditions with useEffect(() => Sweety#setState())
  if (subscribeRef.current == null) {
    const unsubscribe = contextRef.current.subscribeOnWatchedStores(() => {
      watcherUpdateVersionRef.current = modInc(watcherUpdateVersionRef.current)

      // it should return the onStoreChange callback to call it during the WatchContext#cycle()
      // when the callback is null the cycle does not call so watched stores do not unsubscribe
      return onStoreChangeRef.current
    })

    subscribeRef.current = (onStoreChange) => {
      onStoreChangeRef.current = onStoreChange

      return unsubscribe
    }
  }

  // the getState cannot directly return the watcher result
  // because it might be different per each call
  // instead it increments the watcherUpdateVersionRef each time when any watched store changes
  // so the getState will be consistent over multiple calls until the real change happens
  // when the version changes the select function calls the watcher and extracts actual data
  // without that workaround it will go to the re-render hell
  const getState = useCallback(() => watcherUpdateVersionRef.current, [])

  // the select calls each time when updates either the watcher or the watcherUpdateVersionRef
  const select = useCallback(
    () => WatchContext.executeWatcher(watcher),
    [watcher],
  )

  // it should memoize the onCompare otherwise it will call the watcher on each render
  const onCompare = useEvent(compare ?? isEqual)

  const value = useSyncExternalStoreWithSelector(
    subscribeRef.current,
    getState,
    getState,
    select,
    onCompare,
  )

  useDebugValue(value)

  return value
}
