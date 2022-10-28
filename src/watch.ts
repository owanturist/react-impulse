import { FC, useRef, useMemo, useEffect } from "react"
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector.js"

import { WatchContext } from "./WatchContext"

export const useSweetyMemo: typeof useMemo = (factory, deps) => {
  // const contextRef = useRef<WatchContext>()
  // const subscribeRef = useRef<(onStoreChange: VoidFunction) => VoidFunction>(
  //   null as never,
  // )
  // const getStateRef = useRef<() => number>(null as never)

  // if (contextRef.current == null) {
  //   contextRef.current = new WatchContext()

  //   let version = 0
  //   let onWatchedStoresUpdate: null | VoidFunction = null

  //   getStateRef.current = () => version

  //   const unsubscribe = contextRef.current.subscribeOnWatchedStores(() => {
  //     version++

  //     return onWatchedStoresUpdate
  //   })

  //   subscribeRef.current = (onStoreChange) => {
  //     onWatchedStoresUpdate = onStoreChange

  //     return unsubscribe
  //   }
  // }

  // const buster = useSyncExternalStore(
  //   subscribeRef.current,
  //   getStateRef.current,
  //   getStateRef.current,
  // )

  const versionRef = useRef(0)
  const cleanup = useRef<VoidFunction>()

  if (cleanup.current == null) {
    cleanup.current = WatchContext.current?.subscribeOnWatchedStores(() => {
      versionRef.current++

      return null
    })
  }

  useEffect(() => cleanup.current, [])

  return useMemo(
    factory,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps && [...deps, versionRef.current],
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

      const unsubscribe = contextRef.current.subscribeOnWatchedStores(
        (stores) => {
          version++

          // it should return the onStoreChange callback to call it during the WatchContext#cycle()
          // when the callback is null the cycle does not call so watched stores do not unsubscribe
          return onWatchedStoresUpdate
        },
      )

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
