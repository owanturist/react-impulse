import { isFunction } from "~/tools/is-function"

import { enqueue } from "./enqueue"
import type { ReadableImpulse } from "./readable-impulse"
import { STATIC_SCOPE, type Scope } from "./scope"

/**
 * Ignores tracking any of the impulses attached to the provided Scope.
 * Acts like `batch` but returns the `factory` function result.
 *
 * @param factory a function that provides `Scope` as the first argument and returns a result.
 *
 * @returns the `factory` function result.
 *
 * @version 2.0.0
 */
export function untrack<TResult>(factory: (scope: Scope) => TResult): TResult

/**
 * Extracts the value from the provided `impulse` without tracking it.
 *
 * @param impulse anything that implements the `ReadableImpulse` interface.
 *
 * @returns the `impulse` value.
 *
 * @version 2.0.0
 */
export function untrack<TValue>(impulse: ReadableImpulse<TValue>): TValue

export function untrack<T>(
  factoryOrReadableImpulse: ((scope: Scope) => T) | ReadableImpulse<T>,
): T {
  return enqueue(() => {
    if (isFunction(factoryOrReadableImpulse)) {
      return factoryOrReadableImpulse(STATIC_SCOPE)
    }

    return factoryOrReadableImpulse.getValue(STATIC_SCOPE)
  })
}
