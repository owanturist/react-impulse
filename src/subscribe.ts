import { EMITTER_KEY, type Scope, injectScope } from "./Scope"
import { ScopeEmitter } from "./ScopeEmitter"
import { defineExecutionContext } from "./validation"

/**
 * A function that provides `Scope` as the first argument subscribes to changes of all `Impulse` instances that call the `Impulse#getValue` method inside the `listener`.
 *
 * @param listener function that will be called on each `Impulse` change, involved in the `listener` execution. Calls first time synchronously when `subscribe` is called.
 * @returns cleanup function that unsubscribes the `listener`
 */
export function subscribe(listener: (scope: Scope) => void): VoidFunction {
  const emitter = ScopeEmitter._init()

  const emit = (): void => {
    defineExecutionContext("subscribe", injectScope, listener, {
      [EMITTER_KEY]: emitter,
      version: emitter._getVersion(),
    })
  }

  emit()

  return emitter._onEmit(emit)
}
