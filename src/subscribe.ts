import { SCOPE_KEY, Scope, injectScope } from "./Scope"
import { WatchContext } from "./WatchContext"

/**
 * A function that subscribes to changes of all `Impulse` instances that call the `Impulse#getValue` method inside the `listener`.
 *
 * @param listener function that will be called on each `Impulse` change, involved in the `listener` execution. Calls first time synchronously when `subscribe` is called.
 * @returns cleanup function that unsubscribes the `listener`
 */
export const subscribe = (listener: (scope: Scope) => void): VoidFunction => {
  const context = new WatchContext()

  // TODO update docs about JSON and toString
  injectScope(listener, {
    [SCOPE_KEY]: context,
    version: context.getVersion(),
  })

  return context.subscribe(() => {
    injectScope(listener, {
      [SCOPE_KEY]: context,
      version: context.getVersion(),
    })
  })
}
