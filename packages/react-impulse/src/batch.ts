import type { Signal } from "./impulse"
import { enqueue } from "./_internal/enqueue"
import { type Monitor, UNTRACKED_MONITOR } from "./_internal/scope"

/**
 * A helper to optimize multiple {@link Signal}s updates.
 *
 * @param execute a function that executes multiple {@link Signal.write} calls at ones.
 * It provides {@link Monitor} to the {@link execute} function so it is useful when an async operation accesses the {@link Signal}s' values.
 *
 * @version 1.0.0
 */
function batch(execute: (monitor: Monitor) => void): void {
  enqueue(() => {
    execute(UNTRACKED_MONITOR)
  })
}

export { batch }
