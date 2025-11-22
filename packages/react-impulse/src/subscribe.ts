import { batch } from "./batch"
import type { Destructor } from "./destructor"
import { type Scope, injectScope } from "./_internal/scope"
import { ScopeFactory } from "./_internal/scope-factory"

/**
 * A function that provides `Scope` as the first argument subscribes to changes of all `Impulse` instances that call the `Impulse#getValue` method inside the `listener`.
 *
 * @param listener function that will be called on each `Impulse` change, involved in the `listener` execution. Calls first time synchronously when `subscribe` is called. If `listener` returns a function then it will be called before the next `listener` call.
 * @returns cleanup function that unsubscribes the `listener`
 */
function subscribe(listener: (scope: Scope) => Destructor): VoidFunction {
  let cleanup: Destructor

  const factory = new ScopeFactory()

  const emit = (): void => {
    cleanup?.()
    cleanup = injectScope(listener, factory.create())
  }

  const disconnect = factory.connect(emit)

  emit()

  return () => {
    batch(() => {
      disconnect()
      cleanup?.()
    })
  }
}

export { subscribe }
