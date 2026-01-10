import type { Monitor } from "@owanturist/signal"
import { MonitorFactory } from "@owanturist/signal/monitor-factory"
import { useCallback } from "react"
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/with-selector"

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
