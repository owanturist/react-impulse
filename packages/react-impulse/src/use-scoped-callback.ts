import type { DependencyList } from "./dependency-list"
import { useScopedMemo } from "./use-scoped-memo"
import { enqueue } from "./_internal/enqueue"
import type { Scope } from "./_internal/scope"

/**
 * The hook is an `Impulse` version of the `React.useCallback` hook.
 *
 * @param callback a function to memoize, the memoized function injects Scope as the first argument and updates whenever any of the `dependencies` values change.
 * @param dependencies an array of values used in the `callback` function.
 *
 * @version 1.3.0
 */

function useScopedCallback<TArgs extends ReadonlyArray<unknown>, TResult>(
  callback: (scope: Scope, ...args: TArgs) => TResult,
  dependencies: DependencyList,
): (...args: TArgs) => TResult {
  return useScopedMemo((scope) => {
    return (...args) => enqueue(() => callback(scope, ...args))
    // biome-ignore lint/correctness/useExhaustiveDependencies: pass dependencies as is
  }, dependencies)
}

export { useScopedCallback }
