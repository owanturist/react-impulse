import { SetStateContext } from "./SetStateContext"

/**
 * A helper to optimize multiple `Sweety` updates.
 *
 * @param execute a function that executes multiple `Sweety#setState` calls at ones.
 */
export const batch = (execute: VoidFunction): void => {
  const [emit] = SetStateContext.registerStoreSubscribers()

  execute()

  emit()
}
