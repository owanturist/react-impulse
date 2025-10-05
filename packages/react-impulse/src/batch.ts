import { UNTRACKED_SCOPE, type Scope } from "./scope"
import { ScopeEmitter } from "./scope-emitter"

/**
 * A helper to optimize multiple Impulse updates.
 *
 * @param execute a function that executes multiple `Impulse#setValue` calls at ones. It provides `Scope` to the `execute` function so it is useful when an async operation accesses the Impulses' values.
 *
 * @since 1.0.0
 */
export function batch(execute: (scope: Scope) => void): void {
  ScopeEmitter._schedule(() => {
    execute(UNTRACKED_SCOPE)
  })
}
