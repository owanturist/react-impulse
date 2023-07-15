import { useCallback, useDebugValue } from "react"

import { Compare, eq, useEvent } from "./utils"
import { useScope } from "./useScope"
import { defineExecutionContext } from "./validation"
import { Scope, injectScope } from "./Scope"

/**
 * A hook that executes the `watcher` function whenever any of the involved Impulses' values update
 * but enqueues a re-render only when the resulting value is different from the previous.
 *
 * @param watcher a function that subscribes to all Impulses calling the `Impulse#getValue` method inside the function.
 * @param compare an optional `Compare` function. When not defined or `null` then `Object.is` applies as a fallback.
 *
 * @version 1.0.0
 */
export function useWatchImpulse<T>(
  watcher: () => T,
  compare?: null | Compare<T>,
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
  const va = useScope(transform, useEvent(compare ?? eq))

  useDebugValue(va)

  return va
}
