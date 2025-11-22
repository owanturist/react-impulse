import { useCallback, useSyncExternalStoreWithSelector } from "../_dependencies"

import type { Scope } from "./scope"
import { ScopeFactory } from "./scope-factory"
import { usePermanent } from "./use-permanent"

function useCreateScope<T>(
  transform: (scope: Scope) => T,
  compare?: (left: T, right: T) => boolean,
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

  return useSyncExternalStoreWithSelector(connect, selectCreate, selectCreate, select, compare)
}

export { useCreateScope }
