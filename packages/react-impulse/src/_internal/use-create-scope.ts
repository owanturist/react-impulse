import { useCallback } from "react"
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/with-selector"

import type { Monitor } from "./scope"
import { MonitorFactory } from "./scope-factory"
import { usePermanent } from "./use-permanent"

function useCreateMonitor<T>(
  transform: (monitor: Monitor) => T,
  equals?: (left: T, right: T) => boolean,
): T {
  const [selectCreateMonitor, connect] = usePermanent(() => {
    const factory = new MonitorFactory()

    return [
      //
      () => factory.create,
      (emit: VoidFunction) => factory.connect(emit),
    ]
  })

  const select = useCallback((create: () => Monitor) => transform(create()), [transform])

  return useSyncExternalStoreWithSelector(
    connect,
    selectCreateMonitor,
    selectCreateMonitor,
    select,
    equals,
  )
}

export { useCreateMonitor }
