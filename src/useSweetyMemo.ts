import { useMemo } from "react"
import { useSyncExternalStore } from "use-sync-external-store/shim"

import { useWatchContext } from "./useWatchContext"

export const useSweetyMemo: typeof useMemo = (factory, deps) => {
  const { context, subscribe, getState } = useWatchContext()

  const buster = useSyncExternalStore(subscribe, getState, getState)

  return useMemo(
    () => context.watchStores(factory),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps && [...deps, buster],
  )
}
