import {
  DependencyList,
  EffectCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useCallback,
} from "react"

import { useScope } from "./useScope"
import { Scope } from "./Scope"

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
export function useScopedEffect(
  effect: (scope: Scope) => ReturnType<EffectCallback>,
  dependencies?: DependencyList,
): void {
  const getScope = useScope()

  useEffect(
    () => effect(getScope()),
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
export function useScopedLayoutEffect(
  effect: (scope: Scope) => ReturnType<EffectCallback>,
  dependencies?: DependencyList,
): void {
  const getScope = useScope()

  useLayoutEffect(
    () => effect(getScope()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies && [...dependencies, getScope],
  )
}

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
export function useScopedMemo<TValue>(
  factory: (scope: Scope) => TValue,
  dependencies: undefined | DependencyList,
): TValue {
  const getScope = useScope()

  return useMemo(
    () => factory(getScope()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies && [...dependencies, getScope],
  )
}

// TODO add tests, docs
export function useScopedCallback<
  TArgs extends ReadonlyArray<unknown>,
  TResult,
>(
  callback: (scope: Scope, ...args: TArgs) => TResult,
  dependencies: DependencyList,
): (...args: TArgs) => TResult {
  const getScope = useScope()

  return useCallback(
    (...args: TArgs) => callback(getScope(), ...args),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...dependencies, getScope],
  )
}
