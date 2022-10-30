import { useEffect } from "react"
import { useSyncExternalStore } from "use-sync-external-store/shim"

import { useWatchContext } from "./useWatchContext"

export const createEffectHook =
  (useReactEffect: typeof useEffect): typeof useEffect =>
  (effect, deps) => {
    const { context, subscribe, getState } = useWatchContext()

    const buster = useSyncExternalStore(subscribe, getState, getState)

    useReactEffect(() => context.watchStores(effect), deps && [...deps, buster])
  }
