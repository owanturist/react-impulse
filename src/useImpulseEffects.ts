import {
  DependencyList,
  EffectCallback,
  useEffect,
  useLayoutEffect,
} from "react"

import { useScope } from "./useScope"
import { injectScope } from "./Scope"

/**
 * The hook is an `Impulse` version of the `React.useEffect` hook.
 * During the `effect` execution, all the Impulses
 * calling the `Impulse#getValue` method become _phantom dependencies_ of the hook.
 *
 * @param effect a function that runs whenever any of the `dependencies`' values change. Can return a cleanup function to cancel running side effects
 * @param dependencies an optional array of values used in the `effect` function.
 *
 * @version 1.0.0
 */
export function useImpulseEffect(
  effect: () => ReturnType<EffectCallback>,
  dependencies?: DependencyList,
): void {
  const getScope = useScope()

  useEffect(
    () => injectScope(getScope(), effect),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies && [...dependencies, getScope],
  )
}

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
export function useImpulseLayoutEffect(
  effect: () => ReturnType<EffectCallback>,
  dependencies?: DependencyList,
): void {
  const getScope = useScope()

  useLayoutEffect(
    () => injectScope(getScope(), effect),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies && [...dependencies, getScope],
  )
}
