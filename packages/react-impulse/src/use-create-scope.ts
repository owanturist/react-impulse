import { isFunction } from "~/tools/is-function"

import { useCallback, useSyncExternalStoreWithSelector } from "./dependencies"
import { EMITTER_KEY, type Scope } from "./scope"
import { ScopeEmitter } from "./scope-emitter"
import { usePermanent } from "./use-permanent"

function useInitScopeEmitter(): {
  emitter: ScopeEmitter
  subscribe: (emit: VoidFunction) => VoidFunction
} {
  return usePermanent(() => {
    let onStoreChange: null | VoidFunction = null
    const emitter = new ScopeEmitter(() => onStoreChange?.())

    return {
      emitter,
      subscribe: (emit: VoidFunction) => {
        onStoreChange = emit

        return () => {
          emitter._flush()
        }
      },
    }
  })
}

export function useCreateScope(): () => Scope
export function useCreateScope<T = () => Scope>(
  transform: (scope: Scope) => T,
  compare: (left: T, right: T) => boolean,
): T
export function useCreateScope<T = () => Scope>(
  transform?: (scope: Scope) => T,
  compare?: (left: T | (() => Scope), right: T | (() => Scope)) => boolean,
): T | (() => Scope) {
  const { emitter, subscribe } = useInitScopeEmitter()

  const select = useCallback(
    (version: number) => {
      const getScope = (): Scope => {
        emitter._detachFromAll()

        return {
          [EMITTER_KEY]: emitter,
          version,
        }
      }

      return isFunction(transform) ? transform(getScope()) : getScope
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
