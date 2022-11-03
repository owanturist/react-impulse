import { FC } from "react"
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector.js"

import { useWatchContext } from "./useWatchContext"

export function watch<TProps extends object>(fc: FC<TProps>): FC<TProps> {
  const SweetyWatcher: FC<TProps> = (props, ctx) => {
    const { executeWatcher, subscribe, getState } = useWatchContext({
      isReadonly: false,
    })

    return useSyncExternalStoreWithSelector(
      subscribe,
      getState,
      getState,
      // no need to memoize since props are a new object on each call
      () => executeWatcher(() => fc(props, ctx)),
    )
  }

  return SweetyWatcher
}
