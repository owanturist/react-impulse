import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector.js"
import { useCallback, useState } from "react"

import { ImpulseEmitter } from "./ImpulseEmitter"
import { EMITTER_KEY, Scope } from "./Scope"
import { Compare } from "./utils"

export function useScope<T = () => Scope>(
  transform?: (scope: Scope) => T,
  compare?: Compare<T>,
): T {
  const [emitter] = useState(() => new ImpulseEmitter())
  const select = useCallback(
    (version: number) => {
      const getScope = (): Scope => {
        emitter.detach()

        return {
          [EMITTER_KEY]: emitter,
          version,
        }
      }

      return transform ? transform(getScope()) : (getScope as T)
    },
    [emitter, transform],
  )

  return useSyncExternalStoreWithSelector(
    emitter.onEmit,
    emitter.getVersion,
    emitter.getVersion,
    select,
    compare,
  )
}
