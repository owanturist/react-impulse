import { SetStateContext } from "./SetStateContext"

/**
 * A helper to optimize multiple Impulse updates.
 *
 * @param execute a function that executes multiple `Impulse#setState` calls at ones.
 *
 * @version 1.0.0
 */
export const batch = (execute: VoidFunction): void => {
  const [emit] = SetStateContext.registerStoreSubscribers()

  execute()

  emit()
}
