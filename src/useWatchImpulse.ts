import { useDebugValue } from "react"

import { Compare, isEqual } from "./utils"
import { Scope } from "./Scope"
import { useScope } from "./useScope"
import { useEvent } from "./useEvent"

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
  watcher: (scope: Scope) => T,
  compare?: null | Compare<T>,
): T {
  const value = useScope(watcher, useEvent(compare ?? isEqual))

  useDebugValue(value)

  return value
}
