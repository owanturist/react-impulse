import { batch } from "./batch"
import type { Destructor } from "./destructor"
import { EMITTER_KEY, type Scope, injectScope } from "./scope"
import { ScopeEmitter } from "./scope-emitter"

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

  const emit = (): void => {
    batch(() => {
      cleanup?.()

      cleanup = injectScope(listener, {
        [EMITTER_KEY]: emitter,
        version: emitter._getVersion(),
      })
    })
  }

  const emitter = new ScopeEmitter(emit)

  emit()

  return () => {
    batch(() => {
      emitter._flush()
      cleanup?.()
    })
  }
}
