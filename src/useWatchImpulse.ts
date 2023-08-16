export { type UseWatchImpulseOptions, useWatchImpulse }

import { useCallback, useDebugValue } from "./dependencies"
import { type Compare, eq, useEvent } from "./utils"
import { useScope } from "./useScope"
import { defineExecutionContext } from "./validation"
import { type Scope, injectScope } from "./Scope"

interface UseWatchImpulseOptions<T> {
  /**
   * The compare function determines whether or not the watcher result is different.
   * If the watcher result is different, a host component re-renders.
   * In many cases specifying the function leads to better performance because it prevents unnecessary updates.
   *
   * @default Object.is
   */
  compare?: null | Compare<T>
}

/**
 * A hook that executes the `watcher` function whenever any of the involved Impulses' values update
 * but enqueues a re-render only when the resulting value is different from the previous.
 *
 * @param watcher a function that subscribes to all Impulses calling the `Impulse#getValue` method inside the function.
 * @param options optional `UseWatchImpulseOptions`.
 *
 * @version 1.0.0
 */
function useWatchImpulse<T>(
  watcher: () => T,
  { compare }: UseWatchImpulseOptions<T> = {},
): T {
  const transform = useCallback(
    (scope: Scope) => {
      return defineExecutionContext(
        "useWatchImpulse",
        injectScope,
        scope,
        watcher,
      )
    },
    [watcher],
  )
  const value = useScope(transform, useEvent(compare ?? eq))

  useDebugValue(value)

  return value
}
