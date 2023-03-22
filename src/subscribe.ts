import { WatchContext } from "./WatchContext"

export const subscribe = (listener: VoidFunction): VoidFunction => {
  // TODO use correct warning source
  const context = new WatchContext("useImpulseMemo")

  context.watchStores(listener)

  return context.subscribe(() => {
    context.watchStores(listener)
  })
}
