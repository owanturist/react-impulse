import { type DependencyList, useMemo } from "./_dependencies"
import { useScope } from "./use-scope"
import type { Scope } from "./_internal/scope"

/**
 * The hook is an `Impulse` version of the `React.useMemo` hook.
 *
 * @param factory a function that provides `Scope` as the first argument and calculates a value `T` whenever any of the `dependencies`' values change.
 * @param dependencies an array of values used in the `factory` function.
 *
 * @version 1.0.0
 */
function useScopedMemo<TResult>(
  factory: (scope: Scope) => TResult,
  dependencies: DependencyList,
): TResult {
  const scope = useScope()

  // biome-ignore lint/correctness/useExhaustiveDependencies: pass dependencies + scope
  return useMemo(() => factory(scope), [...dependencies, scope])
}

export { useScopedMemo }
