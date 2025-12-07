import { isFunction } from "~/tools/is-function"

import type { batch } from "./batch"
import type { ReadableImpulse } from "./readable-impulse"
import { enqueue } from "./_internal/enqueue"
import { type Monitor, UNTRACKED_MONITOR } from "./_internal/monitor"

/**
 * Ignores tracking any of the impulses attached to the provided {@link Monitor}.
 * Acts like {@link batch} but returns the {@link factory} function result.
 *
 * @param factory a function that provides {@link Monitor} as the first argument and returns a result.
 *
 * @returns the {@link factory} function result.
 *
 * @version 1.0.0
 */
function untracked<TResult>(factory: (monitor: Monitor) => TResult): TResult

/**
 * Extracts the value from the provided {@link impulse} without tracking it.
 *
 * @param impulse anything that implements the {@link ReadableImpulse} interface.
 *
 * @returns the {@link impulse} value.
 *
 * @version 1.0.0
 */
function untracked<TValue>(impulse: ReadableImpulse<TValue>): TValue

function untracked<T>(factoryOrReadableImpulse: ((monitor: Monitor) => T) | ReadableImpulse<T>): T {
  return enqueue(() => {
    if (isFunction(factoryOrReadableImpulse)) {
      return factoryOrReadableImpulse(UNTRACKED_MONITOR)
    }

    return factoryOrReadableImpulse.read(UNTRACKED_MONITOR)
  })
}

export { untracked }
