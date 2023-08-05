export { useImpulseCallback }

import { type DependencyList, useMemo } from "./dependencies"
import { useScope } from "./useScope"
import { defineExecutionContext } from "./validation"
import { injectScope } from "./Scope"

/**
 * The hook is an `Impulse` version of the `React.useCallback` hook.
 * Whenever the `callback` executes, all the Impulses
 * calling the `Impulse#getValue` method become _phantom dependencies_ of the hook.
 *
 * @param callback a function to memoize, the memoized value updates whenever any of the `dependencies` values change.
 * @param dependencies an array of values used in the `callback` function.
 *
 * @version 1.0.0
 */

function useImpulseCallback<TArgs extends ReadonlyArray<unknown>, TResult>(
  callback: (...args: TArgs) => TResult,
  dependencies: DependencyList,
): (...args: TArgs) => TResult {
  const getScope = useScope()

  // TODO useScopedMemo when scope is explicitly passed
  return useMemo(
    () => {
      const scope = getScope()

      return (...args) => {
        return defineExecutionContext(
          "useImpulseMemo",
          injectScope,
          scope,
          callback,
          ...args,
        )
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...dependencies, getScope],
  )
}
