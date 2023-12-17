import type { DependencyList } from "./dependencies"
import type { Scope } from "./Scope"
import { useImpulseMemo } from "./useImpulseMemo"

/**
 * The hook is an `Impulse` version of the `React.useCallback` hook.
 * Whenever the `callback` executes, all the Impulses
 * calling the `Impulse#getValue` method become _phantom dependencies_ of the hook.
 *
 * @param callback a function to memoize, the memoized function updates whenever any of the `dependencies` values change.
 * @param dependencies an array of values used in the `callback` function.
 *
 * @version 1.3.0
 */

export function useImpulseCallback<
  TArgs extends ReadonlyArray<unknown>,
  TResult,
>(
  callback: (scope: Scope, ...args: TArgs) => TResult,
  dependencies: DependencyList,
): (...args: TArgs) => TResult {
  return useImpulseMemo(
    (scope) => {
      return (...args) => callback(scope, ...args)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies,
  )
}
