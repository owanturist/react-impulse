import { useSyncExternalStore } from "use-sync-external-store/shim"
import { useMemo, useState } from "react"

import { WatchContext } from "./WatchContext"
import { SCOPE_KEY, Scope } from "./Scope"

export const useScope = (): Scope => {
  const [context] = useState(() => new WatchContext())

  const [subscribe, getVersion] = useMemo(
    () => [
      (onChange: VoidFunction) => context.subscribe(onChange),
      () => context.getVersion(),
    ],
    [context],
  )

  const version = useSyncExternalStore(subscribe, getVersion, getVersion)

  return useMemo(
    () => ({
      [SCOPE_KEY]: context,
      version,
    }),
    [context, version],
  )
}
