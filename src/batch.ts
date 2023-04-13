import { ImpulseEmitter } from "./ImpulseEmitter"

/**
 * A helper to optimize multiple Impulse updates.
 *
 * @param execute a function that executes multiple `Impulse#setValue` calls at ones.
 *
 * @version 1.0.0
 */
export const batch = (execute: VoidFunction): void => {
  ImpulseEmitter.schedule(() => {
    execute()

    return null
  })
}
