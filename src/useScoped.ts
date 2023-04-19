import { DependencyList, useCallback, useDebugValue } from "react"

import { Compare, eq, useEvent } from "./utils"
import { Scope } from "./Scope"
import { useScope } from "./useScope"

/**
 * A hook that executes the `fabric` function whenever any of the involved Impulses' values update
 * but enqueues a re-render only when the resulting value is different from the previous.
 *
 * @param fabric a function that subscribes to all Impulses calling the `Impulse#getValue` method inside the function.
 * @param dependencies TODO
 * @param compare an optional `Compare` function. When not defined or `null` then `Object.is` applies as a fallback.
 *
 * @version 1.0.0
 */
export function useScoped<T>(
  fabric: (scope: Scope) => T,
  dependencies?: DependencyList,
  compare?: null | Compare<T>,
): T {
  const value = useScope(
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useCallback(fabric, dependencies ?? [fabric]),
    useEvent(compare ?? eq),
  )

  useDebugValue(value)

  return value
}
