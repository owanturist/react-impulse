import { useMemo } from "react"
import { useSyncExternalStore } from "use-sync-external-store/shim"

import { useWatchContext } from "./useWatchContext"

export const useSweetyMemo: typeof useMemo = (factory, deps) => {
  const { executeWatcher, subscribe, getState } = useWatchContext({
    isReadonly: true,
  })

  const buster = useSyncExternalStore(subscribe, getState, getState)

  return useMemo(
    () => executeWatcher(factory),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps && [...deps, buster],
  )
}
