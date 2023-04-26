import { EMITTER_KEY, Scope, injectScope } from "./Scope"
import { ScopeEmitter } from "./ScopeEmitter"

/**
 * A function that subscribes to changes of all `Impulse` instances that call the `Impulse#getValue` method inside the `listener`.
 *
 * @param listener function that will be called on each `Impulse` change, involved in the `listener` execution. Calls first time synchronously when `subscribe` is called.
 * @returns cleanup function that unsubscribes the `listener`
 */
export function subscribe(listener: (scope: Scope) => void): VoidFunction {
  const emitter = new ScopeEmitter()
  const getScope = (): Scope => ({
    [EMITTER_KEY]: emitter,
    version: emitter.getVersion(),
  })

  // TODO update docs about JSON and toString
  injectScope(listener, getScope())

  return emitter.onEmit(() => {
    injectScope(listener, getScope())
  })
}
