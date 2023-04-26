import { EMITTER_KEY, Scope, injectScope } from "./Scope"
import { ScopeEmitter } from "./ScopeEmitter"
import { warnContext } from "./validation"

/**
 * A function that subscribes to changes of all `Impulse` instances that call the `Impulse#getValue` method inside the `listener`.
 *
 * @param listener function that will be called on each `Impulse` change, involved in the `listener` execution. Calls first time synchronously when `subscribe` is called.
 * @returns cleanup function that unsubscribes the `listener`
 */
export function subscribe(listener: (scope: Scope) => void): VoidFunction {
  const emitter = new ScopeEmitter()
  const emit = (): void => {
    warnContext("subscribe", injectScope, listener, {
      [EMITTER_KEY]: emitter,
      version: emitter.getVersion(),
    })
  }

  // TODO update docs about JSON and toString
  emit()

  return emitter.onEmit(emit)
}
