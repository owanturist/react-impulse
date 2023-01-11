import { useMemo } from "react"
import { useSyncExternalStore } from "use-sync-external-store/shim"

import { useWatchContext } from "./useWatchContext"

/**
 * The hook is an `Impulse` version of the `React.useMemo` hook.
 * During the `factory` execution, all the Impulses
 * calling the `Impulse#getValue` method become _phantom dependencies_ of the hook.
 *
 * @param factory a function calculates a value `T` whenever any of the `dependencies`' values change.
 * @param dependencies an array of values used in the `factory` function.
 *
 * @version 1.0.0
 */
export const useImpulseMemo: typeof useMemo = (factory, dependencies) => {
  const { executeWatcher, subscribe, getVersion } = useWatchContext({
    warningSource: "useImpulseMemo",
  })

  const buster = useSyncExternalStore(subscribe, getVersion, getVersion)

  return useMemo(
    () => executeWatcher(factory),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies && [...dependencies, buster],
  )
}
