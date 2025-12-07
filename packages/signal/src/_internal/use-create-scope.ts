import { useCallback } from "react"
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/with-selector"

import type { Scope } from "./scope"
import { ScopeFactory } from "./scope-factory"
import { usePermanent } from "./use-permanent"

function useCreateScope<T>(
  transform: (scope: Scope) => T,
  equals?: (left: T, right: T) => boolean,
): T {
  const [selectCreate, connect] = usePermanent(() => {
    const factory = new ScopeFactory()

    return [
      //
      () => factory.create,
      (emit: VoidFunction) => factory.connect(emit),
    ]
  })

  const select = useCallback((create: () => Scope) => transform(create()), [transform])

  return useSyncExternalStoreWithSelector(connect, selectCreate, selectCreate, select, equals)
}

export { useCreateScope }
