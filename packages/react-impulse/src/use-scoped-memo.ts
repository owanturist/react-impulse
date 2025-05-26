import { type DependencyList, useMemo } from "./dependencies"
import type { Scope } from "./scope"
import { useCreateScope } from "./use-create-scope"

/**
 * The hook is an `Impulse` version of the `React.useMemo` hook.
 *
 * @param factory a function that provides `Scope` as the first argument and calculates a value `T` whenever any of the `dependencies`' values change.
 * @param dependencies an array of values used in the `factory` function.
 *
 * @version 1.0.0
 */
export function useScopedMemo<TResult>(
  factory: (scope: Scope) => TResult,
  dependencies: DependencyList,
): TResult {
  const getScope = useCreateScope()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => factory(getScope()), [...dependencies, getScope])
}
