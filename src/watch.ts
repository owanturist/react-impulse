import { FC, useRef, useMemo } from "react"
import { useSyncExternalStore } from "use-sync-external-store/shim"
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector.js"

import { WatchContext } from "./WatchContext"

export const useSweetyMemo: typeof useMemo = (factory, deps) => {
  const setupRef = useRef<{
    context: WatchContext
    getState: () => number
    subscribe: (onStoreChange: VoidFunction) => VoidFunction
  }>()

  if (setupRef.current == null) {
    const [isUsingCurrentContext, context] =
      WatchContext.current == null
        ? [false, new WatchContext()]
        : [true, WatchContext.current]

    let version = 0
    let onWatchedStoresUpdate: null | VoidFunction = null

    const cleanup = context.subscribeOnWatchedStores(() => {
      version++

      return onWatchedStoresUpdate
    })

    setupRef.current = {
      context,
      getState: () => version,
      subscribe: (onStoreChange) => {
        if (!isUsingCurrentContext) {
          onWatchedStoresUpdate = onStoreChange
        }

        return cleanup
      },
    }
  }

  const buster = useSyncExternalStore(
    setupRef.current.subscribe,
    setupRef.current.getState,
    setupRef.current.getState,
  )

  return useMemo(
    () => setupRef.current!.context.watchStores(factory),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps && [...deps, buster],
  )
}

export function watch<TProps extends object>(fc: FC<TProps>): FC<TProps> {
  const SweetyWatcher: FC<TProps> = (props, context) => {
    const contextRef = useRef<WatchContext>()
    const subscribeRef = useRef<(onStoreChange: VoidFunction) => VoidFunction>()
    const getStateRef = useRef<() => number>(null as never)

    if (contextRef.current == null) {
      contextRef.current = new WatchContext()
    }

    // it should subscribe the WatchContext during render otherwise
    // it might lead to race conditions with useEffect(() => Sweety#setState())
    if (subscribeRef.current == null) {
      let version = 0
      let onWatchedStoresUpdate: null | VoidFunction = null

      // the getState cannot directly return the watcher result
      // because it might be different per each call
      // instead it increments the version each time when any watched store changes
      // so the getState will be consistent over multiple calls until the real change happens
      // when the version changes the select function calls the watcher and extracts actual data
      // without that workaround it will go to the re-render hell
      getStateRef.current = () => version

      const unsubscribe = contextRef.current.subscribeOnWatchedStores(() => {
        version++

        // it should return the onStoreChange callback to call it during the WatchContext#cycle()
        // when the callback is null the cycle does not call so watched stores do not unsubscribe
        return onWatchedStoresUpdate
      })

      subscribeRef.current = (onStoreChange) => {
        onWatchedStoresUpdate = onStoreChange

        return unsubscribe
      }
    }

    return useSyncExternalStoreWithSelector(
      subscribeRef.current,
      getStateRef.current,
      getStateRef.current,
      () => contextRef.current!.watchStores(() => fc(props, context)),
    )
  }

  return SweetyWatcher
}
