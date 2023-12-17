import { type DependencyList, useLayoutEffect } from "./dependencies"
import type { Scope } from "./Scope"
import type { Destructor } from "./utils"
import { useScope } from "./useScope"

/**
 * The hook is an `Impulse` version of the `React.useLayoutEffect` hook.
 * During the `effect` execution, all the Impulses
 * calling the `Impulse#getValue` method become _phantom dependencies_ of the hook.
 *
 * @param effect a function that runs whenever any of the `dependencies`' values change. Can return a cleanup function to cancel running side effects
 * @param dependencies an optional array of values used in the `effect` function.
 *
 * @version 1.0.0
 */
export function useScopedLayoutEffect(
  effect: (scope: Scope) => Destructor,
  dependencies?: DependencyList,
): void {
  const getScope = useScope()

  useLayoutEffect(
    () => effect(getScope()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies && [...dependencies, getScope],
  )
}
