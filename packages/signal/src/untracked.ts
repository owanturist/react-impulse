import { isFunction } from "~/tools/is-function"

import type { ReadableImpulse } from "./readable-impulse"
import { enqueue } from "./_internal/enqueue"
import { STATIC_SCOPE, type Scope } from "./_internal/scope"

/**
 * Ignores tracking any of the impulses attached to the provided Scope.
 * Acts like `batch` but returns the `factory` function result.
 *
 * @param factory a function that provides `Scope` as the first argument and returns a result.
 *
 * @returns the `factory` function result.
 *
 * @version 1.0.0
 */
function untracked<TResult>(factory: (scope: Scope) => TResult): TResult

/**
 * Extracts the value from the provided `impulse` without tracking it.
 *
 * @param impulse anything that implements the `ReadableImpulse` interface.
 *
 * @returns the `impulse` value.
 *
 * @version 1.0.0
 */
function untracked<TValue>(impulse: ReadableImpulse<TValue>): TValue

function untracked<T>(factoryOrReadableImpulse: ((scope: Scope) => T) | ReadableImpulse<T>): T {
  return enqueue(() => {
    if (isFunction(factoryOrReadableImpulse)) {
      return factoryOrReadableImpulse(STATIC_SCOPE)
    }

    return factoryOrReadableImpulse.read(STATIC_SCOPE)
  })
}

export { untracked }
