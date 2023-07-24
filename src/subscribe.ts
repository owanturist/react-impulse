export { subscribe }

import { EMITTER_KEY, injectScope } from "./Scope"
import { ScopeEmitter } from "./ScopeEmitter"
import { defineExecutionContext } from "./validation"

/**
 * A function that subscribes to changes of all `Impulse` instances that call the `Impulse#getValue` method inside the `listener`.
 *
 * @param listener function that will be called on each `Impulse` change, involved in the `listener` execution. Calls first time synchronously when `subscribe` is called.
 * @returns cleanup function that unsubscribes the `listener`
 */
function subscribe(listener: VoidFunction): VoidFunction {
  const emitter = new ScopeEmitter()
  const emit = (): void => {
    defineExecutionContext(
      "subscribe",
      injectScope,
      {
        [EMITTER_KEY]: emitter,
        version: emitter._getVersion(),
      },
      listener,
    )
  }

  emit()

  return emitter._onEmit(emit)
}
