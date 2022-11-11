import { useEffect } from "react"
import { useSyncExternalStore } from "use-sync-external-store/shim"

import { useWatchContext } from "./useWatchContext"

export const createEffectHook =
  (useReactEffect: typeof useEffect): typeof useEffect =>
  (effect, deps) => {
    const { executeWatcher, subscribe, getState } = useWatchContext({
      warningSource: null,
    })

    const buster = useSyncExternalStore(subscribe, getState, getState)

    useReactEffect(() => executeWatcher(effect), deps && [...deps, buster])
  }
