import { EMITTER_KEY, type Scope, injectScope } from "./Scope"
import { ScopeEmitter } from "./ScopeEmitter"
import { batch } from "./batch"
import type { Destructor } from "./utils"

/**
 * A function that provides `Scope` as the first argument subscribes to changes of all `Impulse` instances that call the `Impulse#getValue` method inside the `listener`.
 *
 * @param listener function that will be called on each `Impulse` change, involved in the `listener` execution. Calls first time synchronously when `subscribe` is called. If `listener` returns a function then it will be called before the next `listener` call.
 * @returns cleanup function that unsubscribes the `listener`
 */
export function subscribe(
  listener: (scope: Scope) => Destructor,
): VoidFunction {
  let cleanup: Destructor = undefined
  const emitter = ScopeEmitter._init()

  const emit = (): void => {
    batch(() => {
      cleanup?.()

      cleanup = injectScope(listener, {
        [EMITTER_KEY]: emitter,
        version: emitter._getVersion(),
      })
    })
  }

  emit()

  const emitterCleanup = emitter._onEmit(emit)

  return () => {
    batch(() => {
      emitterCleanup()
      cleanup?.()
    })
  }
}
