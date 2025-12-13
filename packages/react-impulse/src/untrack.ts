import { isFunction } from "~/tools/is-function"

import type { batch } from "./batch"
import type { Signal } from "./impulse"
import type { ReadableSignal } from "./readable-impulse"
import { enqueue } from "./_internal/enqueue"
import { type Monitor, UNTRACKED_MONITOR } from "./_internal/scope"

/**
 * Ignores tracking any of the {@link Signal} attached to the provided {@link Monitor}.
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
 * Extracts the value from the provided {@link signal} without tracking it.
 *
 * @param signal anything that implements the {@link ReadableSignal} interface.
 *
 * @returns the {@link signal} value.
 *
 * @version 1.0.0
 */
function untracked<TValue>(signal: ReadableSignal<TValue>): TValue

function untracked<T>(factoryOrReadableSignal: ((monitor: Monitor) => T) | ReadableSignal<T>): T {
  return enqueue(() => {
    if (isFunction(factoryOrReadableSignal)) {
      return factoryOrReadableSignal(UNTRACKED_MONITOR)
    }

    return factoryOrReadableSignal.read(UNTRACKED_MONITOR)
  })
}

export { untracked }
