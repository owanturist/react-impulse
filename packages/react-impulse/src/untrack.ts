import type { ImpulseGetter } from "./Impulse"
import { foo, type Scope } from "./Scope"
import { type Func, isFunction } from "./utils"

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
 * @param impulse anything that implements the `ImpulseGetter` interface.
 *
 * @returns the `impulse` value.
 *
 * @version 2.0.0
 */
export function untrack<TValue>(impulse: ImpulseGetter<TValue>): TValue

export function untrack<T>(
  factoryOrImpulseGetter: ImpulseGetter<T> | Func<[Scope], T>,
): T {
  return foo((scope) => {
    if (isFunction(factoryOrImpulseGetter)) {
      return factoryOrImpulseGetter(scope)
    }

    return factoryOrImpulseGetter.getValue(scope)
  })
}
