import { useEffect, useLayoutEffect } from "react"

import { useScope } from "./useScope"
import { Scope } from "./Scope"

const createEffectHook =
  (useReactEffect: typeof useEffect) =>
  (
    effect: ((scope: Scope) => void) | ((scope: Scope) => VoidFunction),
    dependencies?: ReadonlyArray<unknown>,
  ) => {
    const scope = useScope()

    useReactEffect(
      () => effect(scope),
      dependencies && [...dependencies, scope],
    )
  }

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
export const useImpulseEffect = createEffectHook(useEffect)

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
export const useImpulseLayoutEffect = createEffectHook(useLayoutEffect)
