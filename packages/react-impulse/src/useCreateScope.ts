import { useCallback } from "react"
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector.js"

import { ScopeEmitter } from "./ScopeEmitter"
import { EMITTER_KEY, type Scope } from "./Scope"
import { isFunction, usePermanent, type Func } from "./utils"

export function useCreateScope(): Func<[], Scope>
export function useCreateScope<T = Func<[], Scope>>(
  transform: Func<[Scope], T>,
  compare?: Func<[T, T], boolean>,
): T
export function useCreateScope<T = Func<[], Scope>>(
  transform?: Func<[Scope], T>,
  compare?: Func<[T, T], boolean>,
): T {
  const emitter = usePermanent(ScopeEmitter._init)
  const select = useCallback(
    (version: number) => {
      const getScope = (): Scope => {
        emitter._detachAll()

        return {
          [EMITTER_KEY]: emitter,
          version,
        }
      }

      return isFunction(transform) ? transform(getScope()) : (getScope as T)
    },
    [emitter, transform],
  )

  return useSyncExternalStoreWithSelector(
    emitter._onEmit,
    emitter._getVersion,
    emitter._getVersion,
    select,
    compare,
  )
}
