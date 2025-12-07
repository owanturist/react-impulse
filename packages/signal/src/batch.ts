import type { Impulse } from "./impulse"
import { enqueue } from "./_internal/enqueue"
import { STATIC_SCOPE, type Scope } from "./_internal/scope"

/**
 * A helper to optimize multiple Impulse updates.
 *
 * @param execute a function that executes multiple {@link Impulse.update} calls at ones. It provides `Scope` to the `execute` function so it is useful when an async operation accesses the Impulses' values.
 *
 * @version 1.0.0
 */
function batch(execute: (scope: Scope) => void): void {
  enqueue(() => {
    execute(STATIC_SCOPE)
  })
}

export { batch }
