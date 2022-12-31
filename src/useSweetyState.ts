import { useDebugValue } from "react"

import { Compare, SetSweetyState } from "./utils"
import type { Sweety } from "./Sweety"
import { useGetSweetyState } from "./useGetSweetyState"
import { useSetSweetyState } from "./useSetSweetyState"

/**
 * A hook similar to `React.useState` but for `Sweety` instances.
 * It subscribes to the `sweety` changes and returns the current state with a function to set the state.
 *
 * @param sweety a `Sweety` instance.
 * @param compare an optional `Compare` function. When not defined it uses `Sweety#compare`. When `null` the `Object.is` function applies to compare the states.
 */
export function useSweetyState<T>(
  sweety: Sweety<T>,
  compare?: null | Compare<T>,
): [state: T, setState: SetSweetyState<T>] {
  const value = useGetSweetyState(sweety)

  useDebugValue(value)

  return [value, useSetSweetyState(sweety, compare)]
}
