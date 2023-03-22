import { WatchContext } from "./WatchContext"

export const subscribe = (listener: VoidFunction): VoidFunction => {
  const context = new WatchContext("subscribe")

  context.watchStores(listener)

  return context.subscribe(() => {
    context.watchStores(listener)
  })
}
