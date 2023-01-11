import { SetValueContext } from "./SetValueContext"

/**
 * A helper to optimize multiple Impulse updates.
 *
 * @param execute a function that executes multiple `Impulse#setValue` calls at ones.
 *
 * @version 1.0.0
 */
export const batch = (execute: VoidFunction): void => {
  const [emit] = SetValueContext.registerStoreSubscribers()

  execute()

  emit()
}
