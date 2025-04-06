import {
  useCallback,
  useRef,
  useSyncExternalStoreWithSelector,
} from "./dependencies"
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
  const emitRef = useRef<VoidFunction>(undefined)
  const { emitter, onEmit } = usePermanent(() => ({
    emitter: ScopeEmitter._init(() => emitRef.current?.()),
    onEmit: (emit: VoidFunction) => {
      emitRef.current = emit

      return () => {
        emitter._flush()
      }
    },
  }))
  const select = useCallback(
    (version: number) => {
      const getScope = (): Scope => {
        emitter._cleanup()

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
    onEmit,
    emitter._getVersion,
    emitter._getVersion,
    select,
    compare,
  )
}
