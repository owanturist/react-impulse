import { type DependencyList, useLayoutEffect } from "./_dependencies"
import type { Destructor } from "./destructor"
import { subscribe } from "./subscribe"
import type { Scope } from "./_internal/scope"

/**
 * The hook is an `Impulse` version of the `React.useLayoutEffect` hook.
 *
 * @param effect a function that provides Scope as the first argument and runs whenever any of the `dependencies`' values change. Can return a cleanup function to cancel running side effects
 * @param dependencies an optional array of values used in the `effect` function.
 *
 * @version 1.0.0
 */
function useScopedLayoutEffect(
  effect: (scope: Scope) => Destructor,
  dependencies?: DependencyList,
): void {
  // biome-ignore lint/correctness/useExhaustiveDependencies: pass dependencies as is
  useLayoutEffect(() => subscribe(effect), dependencies)
}

export { useScopedLayoutEffect }
