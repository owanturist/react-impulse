import { useRef } from "react"

import { WatchContext } from "./WatchContext"

interface UseWatchContextResult {
  executeWatcher: <T>(watcher: () => T) => T
  getState: () => number
  subscribe: (onStoreChange: VoidFunction) => VoidFunction
}

export const useWatchContext = (): UseWatchContextResult => {
  const setupRef = useRef<UseWatchContextResult>()

  if (setupRef.current == null) {
    const context = new WatchContext()

    setupRef.current = {
      executeWatcher: (watcher) => context.watchStores(watcher),

      // the getState cannot directly return the watcher result
      // because it might be different per each call
      // instead it increments the version each time when any watched store changes
      // so the getState will be consistent over multiple calls until the real change happens
      // when the version changes the select function calls the watcher and extracts actual data
      // without that workaround it will go to the re-render hell
      getState: () => context.getVersion(),

      subscribe: (onStoreChange) => context.subscribe(onStoreChange),
    }
  }

  return setupRef.current
}
