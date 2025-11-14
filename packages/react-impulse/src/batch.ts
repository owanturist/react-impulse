import { STATIC_SCOPE, type Scope } from "./scope"
import { enqueue } from "./scope-emitter"

/**
 * A helper to optimize multiple Impulse updates.
 *
 * @param execute a function that executes multiple `Impulse#setValue` calls at ones. It provides `Scope` to the `execute` function so it is useful when an async operation accesses the Impulses' values.
 *
 * @version 1.0.0
 */
export function batch(execute: (scope: Scope) => void): void {
  enqueue(() => {
    execute(STATIC_SCOPE)
  })
}
