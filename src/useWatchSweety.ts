import { useRef, useReducer, useEffect } from "react"

import { Compare, modInc, isEqual } from "./utils"
import { WatchContext } from "./WatchContext"

/**
 * A hook that subscribes to all `InnerStore#getState` execution involved in the `watcher` call.
 * Due to the mutable nature of `InnerStore` instances a parent component won't be re-rendered when a child's `InnerStore` value is changed.
 * The hook gives a way to watch after deep changes in the store's values and trigger a re-render when the returning value is changed.
 *
 * @param watcher a function to read only the watching value meaning that it never should call `InnerStore.of`, `InnerStore#clone`, `InnerStore#setState` or `InnerStore#subscribe` methods inside.
 * @param compare an optional compare function.
 * The strict equality check function (`===`) will be used if `null` or not defined.
 *
 * @see {@link InnerStore.getState}
 * @see {@link Compare}
 */
export function useInnerWatch<T>(
  watcher: () => T,
  compare?: null | Compare<T>,
): T {
  const [, render] = useReducer(modInc, 0)

  const valueRef = useRef<T>()
  const watcherRef = useRef<() => T>()
  // workaround to handle changes of the watcher returning value
  if (watcherRef.current !== watcher) {
    valueRef.current = WatchContext.executeWatcher(watcher)
  }

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

  const compareRef = useRef(compare ?? isEqual)
  useEffect(() => {
    compareRef.current = compare ?? isEqual
  }, [compare])

  useEffect(() => {
    watcherRef.current = watcher
    contextRef.current!.activate(watcher)
  }, [watcher])

  // cleanup everything when unmounts
  useEffect(() => {
    return () => {
      contextRef.current!.cleanup()
    }
  }, [])

  return valueRef.current!
}
