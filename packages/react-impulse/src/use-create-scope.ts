import { noop } from "~/tools/noop"

import { useCallback, useSyncExternalStoreWithSelector } from "./dependencies"
import type { Scope } from "./scope"
import { ScopeEmitter } from "./scope-emitter"
import { usePermanent } from "./use-permanent"

export function useCreateScope<T>(
  transform: (scope: Scope) => T,
  compare?: (left: T, right: T) => boolean,
): T {
  const [getSpawn, sub] = usePermanent(() => {
    let onStoreChange = noop

    const emitter = new ScopeEmitter(() => onStoreChange())

    return [
      () => emitter._spawn,

      (emit: VoidFunction) => {
        onStoreChange = emit

        return () => {
          emitter._flush()
        }
      },
    ]
  })

  return useSyncExternalStoreWithSelector(
    sub,
    getSpawn,
    getSpawn,
    useCallback((getScope) => transform(getScope()), [transform]),
    compare,
  )
}
