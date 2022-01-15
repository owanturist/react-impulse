import { useRef, useReducer, useEffect } from "react"

import { Compare, modInc, isEqual } from "./utils"
import { WatchContext } from "./WatchContext"

/**
 * A hook that subscribes to all `InnerStore#getState` execution involved in the `watcher` call.
 * Due to the mutable nature of `InnerStore` instances a parent component won't be re-rendered when a child's `InnerStore` value is changed.
 * The hook gives a way to watch after deep changes in the store's values and trigger a re-render when the returning value is changed.
 *
 * @param watcher a function to read only the watching value meaning that it never should call `InnerStore.of`, `InnerStore#clone`, `InnerStore#setState` or `InnerStore#subscribe` methods inside.
 * @param compare a function with strict check (`===`) by default.
 *
 * @see {@link InnerStore.getState}
 * @see {@link Compare}
 */
export function useInnerWatch<T>(
  watcher: () => T,
  compare: Compare<T> = isEqual,
): T {
  const [x, render] = useReducer(modInc, 0)

  const valueRef = useRef<T>()
  const watcherRef = useRef<() => T>()
  // workaround to handle changes of the watcher returning value
  if (watcherRef.current !== watcher) {
    valueRef.current = WatchContext.executeWatcher(watcher)
  }

  const compareRef = useRef(compare)
  useEffect(() => {
    compareRef.current = compare
  }, [compare])

  // permanent ref
  const contextRef = useRef<WatchContext>()
  if (contextRef.current == null) {
    contextRef.current = new WatchContext(() => {
      const currentValue = valueRef.current!
      const nextValue = WatchContext.executeWatcher(watcherRef.current!)

      if (!compareRef.current(currentValue, nextValue)) {
        valueRef.current = nextValue
        render()
      }
    })
  }

  useEffect(() => {
    watcherRef.current = watcher
    contextRef.current!.activate(watcher)
  }, [x, watcher])

  // cleanup everything when unmounts
  useEffect(() => {
    return () => {
      contextRef.current!.cleanup()
    }
  }, [])

  return valueRef.current!
}
