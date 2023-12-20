import { EMITTER_KEY, type Scope, injectScope } from "./Scope"
import { ScopeEmitter } from "./ScopeEmitter"
import { noop, type Destructor } from "./utils"
import { defineExecutionContext } from "./validation"

/**
 * A function that provides `Scope` as the first argument subscribes to changes of all `Impulse` instances that call the `Impulse#getValue` method inside the `listener`.
 *
 * @param listener function that will be called on each `Impulse` change, involved in the `listener` execution. Calls first time synchronously when `subscribe` is called. If `listener` returns a function then it will be called before the next `listener` call.
 * @returns cleanup function that unsubscribes the `listener`
 */
export function subscribe(
  listener: (scope: Scope) => Destructor,
): VoidFunction {
  let cleanup: Destructor = noop
  const emitter = ScopeEmitter._init()

  const emit = (): void => {
    cleanup?.()

    cleanup = defineExecutionContext("subscribe", injectScope, listener, {
      [EMITTER_KEY]: emitter,
      version: emitter._getVersion(),
    })
  }

  emit()

  const emitterCleanup = emitter._onEmit(emit)

  return () => {
    emitterCleanup()
    cleanup?.()
  }
}
