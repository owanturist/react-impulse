import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector.js"
import { useCallback, useState } from "react"

import { WatchContext } from "./WatchContext"
import { SCOPE_KEY, Scope } from "./Scope"
import { Compare } from "./utils"

export function useScope<T = () => Scope>(
  transform?: (scope: Scope) => T,
  compare?: Compare<T>,
): T {
  const [context] = useState(() => new WatchContext())
  const select = useCallback(
    (version: number) => {
      const getScope = (): Scope => {
        context.clean()

        return {
          [SCOPE_KEY]: context,
          version,
        }
      }

      return transform ? transform(getScope()) : (getScope as T)
    },
    [context, transform],
  )

  return useSyncExternalStoreWithSelector(
    context.subscribe,
    context.getVersion,
    context.getVersion,
    select,
    compare,
  )
}
