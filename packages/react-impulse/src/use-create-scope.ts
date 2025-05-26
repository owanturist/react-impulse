import { isFunction } from "~/tools/is-function"

import {
  useCallback,
  useRef,
  useSyncExternalStoreWithSelector,
} from "./dependencies"
import { EMITTER_KEY, type Scope } from "./scope"
import { ScopeEmitter } from "./scope-emitter"
import { usePermanent } from "./use-permanent"

export function useCreateScope(): () => Scope
export function useCreateScope<T = () => Scope>(
  transform: (scope: Scope) => T,
  compare?: (left: T, right: T) => boolean,
): T
export function useCreateScope<T = () => Scope>(
  transform?: (scope: Scope) => T,
  compare?: (left: T, right: T) => boolean,
): T {
  const emitRef = useRef<null | VoidFunction>(null)
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
        emitter._detachEverywhere()

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
