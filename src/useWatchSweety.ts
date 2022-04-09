import { useRef, useEffect, useCallback } from "react"
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/with-selector"

import { Compare, isEqual } from "./utils"
import { WatchContext } from "./WatchContext"

const identity = <T>(value: T): T => value

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
  const contextRef = useRef<WatchContext>()
  // const watcherRef = useRef(watcher)

  if (contextRef.current == null) {
    contextRef.current = new WatchContext()
  }

  const getState = useCallback(() => {
    return WatchContext.executeWatcher(watcher)
  }, [watcher])

  useEffect(() => {
    contextRef.current!.activate(watcher)
  }, [watcher])

  return useSyncExternalStoreWithSelector(
    useCallback((fire) => contextRef.current!.subscribe(fire), []),
    getState,
    getState,
    identity,
    compare ?? isEqual,
  )

  // const [, render] = useReducer(modInc, 0)

  // const valueRef = useRef<T>()
  // // const watcherRef = useRef<() => T>()
  // // workaround to handle changes of the watcher returning value
  // if (watcherRef.current !== watcher) {
  //   valueRef.current = WatchContext.executeWatcher(watcher)
  // }

  // // permanent ref
  // // const contextRef = useRef<WatchContext>()
  // if (contextRef.current == null) {
  //   contextRef.current = new WatchContext(() => {
  //     const currentValue = valueRef.current!
  //     const nextValue = WatchContext.executeWatcher(watcherRef.current)

  //     if (!compareRef.current(currentValue, nextValue)) {
  //       valueRef.current = nextValue
  //       render()
  //     }
  //   })
  // }

  // const compareRef = useRef(compare ?? isEqual)
  // useEffect(() => {
  //   compareRef.current = compare ?? isEqual
  // }, [compare])

  // useEffect(() => {
  //   watcherRef.current = watcher
  //   contextRef.current.activate(watcher)
  // }, [watcher])

  // // cleanup everything when unmounts
  // useEffect(() => {
  //   return () => {
  //     contextRef.current.cleanup()
  //   }
  // }, [])

  // return valueRef.current!
}
