import { ScopeEmitter } from "./ScopeEmitter"

/**
 * A helper to optimize multiple Impulse updates.
 *
 * @param execute a function that executes multiple `Impulse#setValue` calls at ones.
 *
 * @version 1.0.0
 */
export function batch(execute: VoidFunction): void {
  ScopeEmitter._schedule(() => {
    execute()

    return null
  })
}
