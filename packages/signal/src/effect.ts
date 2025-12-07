import { batch } from "./batch"
import type { Destructor } from "./destructor"
import type { Impulse } from "./impulse"
import { type Monitor, injectMonitor } from "./_internal/monitor"
import { MonitorFactory } from "./_internal/monitor-factory"

/**
 * A function that provides {@link Monitor} as the first argument subscribes to changes of all {@link Impulse} instances that call the {@link Impulse.read} method inside the {@link listener}.
 *
 * @param listener Function that will be called on each {@link Impulse} change, involved in the {@link listener} execution.
 * Calls first time synchronously when {@link effect} is called.
 * If {@link listener} returns a function then it will be called before the next {@link listener} call.
 *
 * @returns Dispose function that unsubscribes the {@link listener} from all involved {@link Impulse} instances.
 *
 * @version 1.0.0
 */
function effect(listener: (monitor: Monitor) => Destructor): VoidFunction {
  let dispose: Destructor

  const factory = new MonitorFactory()

  const emit = (): void => {
    dispose?.()
    dispose = injectMonitor(listener, factory.create())
  }

  const disconnect = factory.connect(emit)

  emit()

  return () => {
    batch(() => {
      disconnect()
      dispose?.()
    })
  }
}

export { effect }
