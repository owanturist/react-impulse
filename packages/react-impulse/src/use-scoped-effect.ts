import { type DependencyList, useEffect } from "./dependencies"
import type { Destructor } from "./destructor"
import type { Scope } from "./scope"
import { subscribe } from "./subscribe"

/**
 * The hook is an `Impulse` version of the `React.useEffect` hook.
 *
 * @param effect a function that provides Scope as the first argument and runs whenever any of the `dependencies`' values change. Can return a cleanup function to cancel running side effects
 * @param dependencies an optional array of values used in the `effect` function.
 *
 * @version 1.0.0
 */
export function useScopedEffect(
  effect: (scope: Scope) => Destructor,
  dependencies?: DependencyList,
): void {
  useEffect(
    () => subscribe(effect),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies,
  )
}
