import { useCallback, useDebugValue } from "react"
import { useSyncExternalStore } from "use-sync-external-store/shim/index.js"

import type { Sweety } from "./Sweety"
import { WatchContext } from "./WatchContext"

/**
 * A hook that subscribes to the `sweety` changes and returns the current state.
 *
 * @param sweety a `Sweety` instance.
 */
export function useGetSweetyState<T>(sweety: Sweety<T>): T {
  const value = useSyncExternalStore(
    useCallback((onStoreChange) => sweety.subscribe(onStoreChange), [sweety]),
    useCallback(() => WatchContext.ignore(() => sweety.getState()), [sweety]),
  )

  useDebugValue(value)

  return value
}