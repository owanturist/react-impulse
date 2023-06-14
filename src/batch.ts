import { STATIC_SCOPE, Scope } from "./Scope"
import { ScopeEmitter } from "./ScopeEmitter"

/**
 * A helper to optimize multiple Impulse updates.
 *
 * @param execute a function that executes multiple `Impulse#setValue` calls at ones.
 *
 * @version 1.0.0
 */
export function batch(execute: (scope: Scope) => void): void {
  ScopeEmitter.schedule(() => {
    execute(STATIC_SCOPE)

    return null
  })
}
