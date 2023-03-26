import { useCallback, useDebugValue, useMemo, useState } from "react"
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector.js"

import { Compare, eq, useEvent } from "./utils"
import { SCOPE_KEY, Scope } from "./Scope"
import { WatchContext } from "./WatchContext"

/**
 * A hook that executes the `watcher` function whenever any of the involved Impulses' values update
 * but enqueues a re-render only when the resulting value is different from the previous.
 *
 * @param watcher a function that subscribes to all Impulses calling the `Impulse#getValue` method inside the function.
 * @param compare an optional `Compare` function. When not defined or `null` then `Object.is` applies as a fallback.
 *
 * @version 1.0.0
 */
export function useWatchImpulse<T>(
  watcher: (scope: Scope) => T,
  compare?: null | Compare<T>,
): T {
  const [context] = useState(() => new WatchContext())

  const [subscribe, getVersion] = useMemo(
    () => [
      (onChange: VoidFunction) => context.subscribe(onChange),
      () => context.getVersion(),
    ],
    [context],
  )

  // the select calls each time when updates either the watcher or the version
  const select = useCallback(
    (version: number) => watcher({ [SCOPE_KEY]: context, version }),
    [watcher, context],
  )

  const value = useSyncExternalStoreWithSelector(
    subscribe,
    getVersion,
    getVersion,
    select,
    useEvent(compare ?? eq),
  )

  useDebugValue(value)

  return value
}
