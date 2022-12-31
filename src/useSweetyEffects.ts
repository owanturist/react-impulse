import { useEffect, useLayoutEffect } from "react"
import { useSyncExternalStore } from "use-sync-external-store/shim"

import { useWatchContext } from "./useWatchContext"

const createEffectHook =
  (useReactEffect: typeof useEffect): typeof useEffect =>
  (effect, dependencies) => {
    const { executeWatcher, subscribe, getState } = useWatchContext({
      warningSource: null,
    })

    const buster = useSyncExternalStore(subscribe, getState, getState)

    useReactEffect(
      () => executeWatcher(effect),
      dependencies && [...dependencies, buster],
    )
  }

/**
 * The hook is a `Sweety` version of the `React.useEffect` hook.
 * During the `effect` execution, all the `Sweety` instances
 * that call the `Sweety#getState` method become _phantom dependencies_ of the hook.
 *
 * @param effect a function that runs whenever any of the `dependencies`' values change. Can return a cleanup function to cancel running side effects
 * @param dependencies an optional array of values used in the `effect` function.
 *
 * @version 2.1.0
 */
export const useSweetyEffect = createEffectHook(useEffect)

/**
 * The hook is a `Sweety` version of the `React.useLayoutEffect` hook.
 * During the `effect` execution, all the `Sweety` instances
 * that call the `Sweety#getState` method become _phantom dependencies_ of the hook.
 *
 * @param effect a function that runs whenever any of the `dependencies`' values change. Can return a cleanup function to cancel running side effects
 * @param dependencies an optional array of values used in the `effect` function.
 *
 * @version 2.1.0
 */
export const useSweetyLayoutEffect = createEffectHook(useLayoutEffect)
