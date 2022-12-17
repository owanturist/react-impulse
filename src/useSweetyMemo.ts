import { useMemo } from "react"
import { useSyncExternalStore } from "use-sync-external-store/shim"

import { useWatchContext } from "./useWatchContext"

/**
 * The hook is a `Sweety` version of the `React.useMemo` hook.
 * During the `factory` execution, all the `Sweety` instances
 * that call the `Sweety#getState` method become _phantom dependencies_ of the hook.
 *
 * @param factory a function calculates a value `T` whenever any of the `dependencies`' values change.
 * @param dependencies an array of values used in the `factory` function.
 *
 * @version 2.1.0
 */
export const useSweetyMemo: typeof useMemo = (factory, deps) => {
  const { executeWatcher, subscribe, getState } = useWatchContext({
    warningSource: "useSweetyMemo",
  })

  const buster = useSyncExternalStore(subscribe, getState, getState)

  return useMemo(
    () => executeWatcher(factory),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps && [...deps, buster],
  )
}
