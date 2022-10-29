import { useRef } from "react"

import { noop } from "./utils"
import { WatchContext } from "./WatchContext"

const modInc = (x: number): number => {
  return (x + 1) % 10e9
}

interface UseWatchContextResult {
  context: WatchContext
  getState: () => number
  subscribe: (onStoreChange: VoidFunction) => VoidFunction
}

export const useWatchContext = (): UseWatchContextResult => {
  const setupRef = useRef<UseWatchContextResult>()

  if (setupRef.current == null) {
    let version = 0
    let onWatchedStoresUpdate = noop

    const context = new WatchContext(() => {
      version = modInc(version)

      // it should return the onStoreChange callback to call it during the WatchContext#cycle()
      // when the callback is null the cycle does not call so watched stores do not unsubscribe
      return onWatchedStoresUpdate
    })

    setupRef.current = {
      context,

      // the getState cannot directly return the watcher result
      // because it might be different per each call
      // instead it increments the version each time when any watched store changes
      // so the getState will be consistent over multiple calls until the real change happens
      // when the version changes the select function calls the watcher and extracts actual data
      // without that workaround it will go to the re-render hell
      getState: () => version,

      subscribe: (onStoreChange) => {
        onWatchedStoresUpdate = onStoreChange

        return () => context.cleanup()
      },
    }
  }

  return setupRef.current
}
