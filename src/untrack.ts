import { STATIC_SCOPE, type Scope } from "./Scope"
import { ScopeEmitter } from "./ScopeEmitter"

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
export function untrack<TResult>(factory: (scope: Scope) => TResult): TResult {
  return ScopeEmitter._schedule(() => factory(STATIC_SCOPE))
}
