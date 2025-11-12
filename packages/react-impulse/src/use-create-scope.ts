import { noop } from "~/tools/noop"

import { useCallback, useSyncExternalStoreWithSelector } from "./dependencies"
import type { Scope } from "./scope"
import { ScopeEmitter } from "./scope-emitter"
import { usePermanent } from "./use-permanent"

function useInitScopeEmitter(): [
  getSpawn: () => () => Scope,
  subscribe: (emit: VoidFunction) => VoidFunction,
] {
  return usePermanent(() => {
    let onStoreChange = noop
    const emitter = new ScopeEmitter(() => onStoreChange())

    return [
      () => emitter._spawn,

      (emit) => {
        onStoreChange = emit

        return () => {
          emitter._flush()
        }
      },
    ]
  })
}

export function useCreateScope<T>(
  transform: (scope: Scope) => T,
  compare?: (left: T, right: T) => boolean,
): T {
  const [getSpawn, subscribe] = useInitScopeEmitter()

  const select = useCallback(
    (spawn: () => Scope) => transform(spawn()),
    [transform],
  )

  return useSyncExternalStoreWithSelector(
    subscribe,
    getSpawn,
    getSpawn,
    select,
    compare,
  )
}
