import type { DependencyList } from "./dependencies"
import type { Scope } from "./scope"
import { ScopeEmitter } from "./scope-emitter"
import { useScopedMemo } from "./use-scoped-memo"

/**
 * The hook is an `Impulse` version of the `React.useCallback` hook.
 *
 * @param callback a function to memoize, the memoized function injects Scope as the first argument and updates whenever any of the `dependencies` values change.
 * @param dependencies an array of values used in the `callback` function.
 *
 * @since 1.3.0
 */

export function useScopedCallback<
  TArgs extends ReadonlyArray<unknown>,
  TResult,
>(
  callback: (scope: Scope, ...args: TArgs) => TResult,
  dependencies: DependencyList,
): (...args: TArgs) => TResult {
  return useScopedMemo((scope) => {
    return (...args) => {
      return ScopeEmitter._schedule(() => callback(scope, ...args))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)
}
