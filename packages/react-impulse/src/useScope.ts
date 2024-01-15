import { useCallback, useSyncExternalStoreWithSelector } from "./dependencies"
import { ScopeEmitter } from "./ScopeEmitter"
import { EMITTER_KEY, type Scope } from "./Scope"
import { isFunction, usePermanent, type Func } from "./utils"

export function useScope(): Func<[], Scope>
export function useScope<T = Func<[], Scope>>(
  transform: Func<[Scope], T>,
  compare?: Func<[T, T], boolean>,
): T
export function useScope<T = Func<[], Scope>>(
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
