import { noop } from "~/tools/noop"

import { useCallback, useSyncExternalStoreWithSelector } from "./dependencies"
import type { Scope } from "./scope"
import { ScopeEmitter } from "./scope-emitter"
import { usePermanent } from "./use-permanent"

export function useCreateScope<T>(
  transform: (scope: Scope) => T,
  compare?: (left: T, right: T) => boolean,
): T {
  const [getFactory, sub] = usePermanent(() => {
    let onStoreChange = noop

    const emitter = new ScopeEmitter(() => onStoreChange())

    return [
      () => emitter._factory,

      (emit: VoidFunction) => {
        onStoreChange = emit

        return () => {
          emitter._invalidate()
        }
      },
    ]
  })

  const select = useCallback(
    (factory: () => Scope) => transform(factory()),
    [transform],
  )

  return useSyncExternalStoreWithSelector(
    sub,
    getFactory,
    getFactory,
    select,
    compare,
  )
}
