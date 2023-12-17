import { type DependencyList, useMemo } from "./dependencies"
import { useScope } from "./useScope"
import { defineExecutionContext } from "./validation"
import type { Scope } from "./Scope"

/**
 * The hook is an `Impulse` version of the `React.useMemo` hook.
 * During the `factory` execution, all the Impulses
 * calling the `Impulse#getValue` method become _phantom dependencies_ of the hook.
 *
 * @param factory a function calculates a value `T` whenever any of the `dependencies`' values change.
 * @param dependencies an array of values used in the `factory` function.
 *
 * @version 1.0.0
 */
export function useScopedMemo<TResult>(
  factory: (scope: Scope) => TResult,
  dependencies: DependencyList,
): TResult {
  const getScope = useScope()

  return useMemo(
    () => defineExecutionContext("useScopedMemo", factory, getScope()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...dependencies, getScope],
  )
}
