import { WatchContext } from "./WatchContext"

/**
 * A function that subscribes to changes of all `Impulse` instances that call the `Impulse#getValue` method inside the `listener`.
 *
 * @param listener function that will be called on each `Impulse` change, involved in the `listener` execution. Calls first time synchronously when `subscribe` is called.
 * @returns cleanup function that unsubscribes the `listener`
 */
export const subscribe = (listener: VoidFunction): VoidFunction => {
  const context = new WatchContext("subscribe")

  context.watchStores(listener)

  return context.subscribe(() => {
    context.watchStores(listener)
  })
}
