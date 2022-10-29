import { FC, useMemo } from "react"
import { useSyncExternalStore } from "use-sync-external-store/shim"
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector.js"

import { useWatchContext } from "./useWatchContext"

export const useSweetyMemo: typeof useMemo = (factory, deps) => {
  const { context, subscribe, getState } = useWatchContext()

  const buster = useSyncExternalStore(subscribe, getState, getState)

  return useMemo(
    () => context.watchStores(factory),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps && [...deps, buster],
  )
}

export function watch<TProps extends object>(fc: FC<TProps>): FC<TProps> {
  const SweetyWatcher: FC<TProps> = (props, ctx) => {
    const { context, subscribe, getState } = useWatchContext()

    return useSyncExternalStoreWithSelector(
      subscribe,
      getState,
      getState,
      () => {
        return context.watchStores(() => fc(props, ctx))
      },
    )
  }

  return SweetyWatcher
}
