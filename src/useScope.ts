import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector.js"
import { useCallback, useMemo, useState } from "react"

import { WatchContext } from "./WatchContext"
import { SCOPE_KEY, Scope } from "./Scope"
import { Compare } from "./utils"

export function useScope<T = Scope>(
  transform?: (scope: Scope) => T,
  compare?: Compare<T>,
): T {
  const [context] = useState(() => new WatchContext())

  const [subscribe, getVersion] = useMemo(
    () => [
      (onChange: VoidFunction) => context.subscribe(onChange),
      () => context.getVersion(),
    ],
    [context],
  )

  const select = useCallback(
    (version: number) => {
      const scope: Scope = { [SCOPE_KEY]: context, version }

      return transform == null ? (scope as T) : transform(scope)
    },
    [context, transform],
  )

  return useSyncExternalStoreWithSelector(
    subscribe,
    getVersion,
    getVersion,
    select,
    compare,
  )
}
