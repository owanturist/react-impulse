import { useDebugValue } from "react"

import { Compare, SetSweetyState } from "./utils"
import type { Sweety } from "./Sweety"
import { useGetSweetyState } from "./useGetSweetyState"
import { useSetSweetyState } from "./useSetSweetyState"

/**
 * A hook that is similar to `React.useState` but for `Sweety` instances.
 * It subscribes to the store changes and returns the current value and a function to set the value.
 * The store won't update if the new value is comparably equal to the current value.
 *
 * @param store a `Sweety` instance.
 * @param compare an optional compare function with medium priority.
 * If not defined it uses `Sweety#compare`.
 * The strict equality check function (`===`) will be used if `null`.
 */
export function useSweetyState<T>(
  store: Sweety<T>,
  compare?: null | Compare<T>,
): [state: T, setState: SetSweetyState<T>] {
  const value = useGetSweetyState(store)

  useDebugValue(value)

  return [value, useSetSweetyState(store, compare)]
}
