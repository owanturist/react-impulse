import { noop } from "~/tools/noop"

import { useCallback, useSyncExternalStoreWithSelector } from "./dependencies"
import { EMITTER_KEY, type Scope } from "./scope"
import { ScopeEmitter } from "./scope-emitter"
import { usePermanent } from "./use-permanent"

function useInitScopeEmitter(): [
  emitter: ScopeEmitter,
  subscribe: (emit: VoidFunction) => VoidFunction,
] {
  return usePermanent(() => {
    let onStoreChange = noop
    const emitter = new ScopeEmitter(() => onStoreChange())

    return [
      emitter,

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
  const [emitter, subscribe] = useInitScopeEmitter()

  const select = useCallback(
    (version: number) => {
      emitter._detachFromAll()

      return transform({
        [EMITTER_KEY]: emitter,
        version,
      })
    },
    [emitter, transform],
  )

  return useSyncExternalStoreWithSelector(
    subscribe,
    emitter._getVersion,
    emitter._getVersion,
    select,
    compare,
  )
}
