import { useCallback, useDebugValue } from "react"
import { useSyncExternalStore } from "use-sync-external-store/shim/index.js"

import type { Sweety } from "./Sweety"

/**
 * A hooks that subscribes to the store's changes and returns the current value.
 *
 * @param store a `Sweety` instance.
 *
 * @see {@link Sweety.getState}
 * @see {@link Sweety.subscribe}
 */
export function useGetSweetyState<T>(store: Sweety<T>): T {
  const value = useSyncExternalStore(
    useCallback((onStoreChange) => store.subscribe(onStoreChange), [store]),
    useCallback(() => store.getState(), [store]),
  )

  useDebugValue(value)

  return value
}
