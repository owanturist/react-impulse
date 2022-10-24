import React, { useRef } from "react"
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector.js"

import { WatchContext } from "./WatchContext"
import { modInc } from "./useWatchSweety"

export const watch = <TProps = Record<string, unknown>>(
  type: React.FC<TProps>,
): React.FC<TProps> => {
  const SweetyWatcher: React.FC<TProps> = (props, context) => {
    const contextRef = useRef<WatchContext>()
    const subscribeRef = useRef<(onStoreChange: VoidFunction) => VoidFunction>()
    const getStateRef = useRef<() => number>(null as never)

    if (contextRef.current == null) {
      contextRef.current = new WatchContext()
    }

    contextRef.current.watchStores(() => type(props, context))

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
        version = modInc(version)

        // it should return the onStoreChange callback to call it during the WatchContext#cycle()
        // when the callback is null the cycle does not call so watched stores do not unsubscribe
        return onWatchedStoresUpdate
      })

      subscribeRef.current = (onStoreChange) => {
        onWatchedStoresUpdate = onStoreChange

        return unsubscribe
      }
    }

    const value = useSyncExternalStoreWithSelector(
      subscribeRef.current,
      getStateRef.current,
      getStateRef.current,
      () => WatchContext.executeWatcher(() => type(props, context)),
    )

    return value
  }

  return SweetyWatcher
}
