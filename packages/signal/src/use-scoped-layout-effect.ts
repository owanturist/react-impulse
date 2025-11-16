import { type DependencyList, useLayoutEffect } from "./dependencies"
import type { Destructor } from "./destructor"
import type { Scope } from "./scope"
import { subscribe } from "./subscribe"

/**
 * The hook is an `Impulse` version of the `React.useLayoutEffect` hook.
 *
 * @param effect a function that provides Scope as the first argument and runs whenever any of the `dependencies`' values change. Can return a cleanup function to cancel running side effects
 * @param dependencies an optional array of values used in the `effect` function.
 *
 * @version 1.0.0
 */
export function useScopedLayoutEffect(
  effect: (scope: Scope) => Destructor,
  dependencies?: DependencyList,
): void {
  // biome-ignore lint/correctness/useExhaustiveDependencies: pass dependencies as is
  useLayoutEffect(() => subscribe(effect), dependencies)
}
