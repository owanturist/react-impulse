import { Dispatch, useDebugValue } from "react"

import { Compare, useEvent } from "./utils"
import type { Sweety } from "./Sweety"
import { useGetSweetyState } from "./useGetSweetyState"
import { useSetSweetyState } from "./useSetSweetyState"

/**
 * A hook similar to `React.useReducer` but for `Sweety` instances.
 * It subscribes to the `sweety` changes and returns the current state and a function to dispatch an action.
 *
 * @param sweety a `Sweety` instance.
 * @param reducer a function that transforms the current state and the dispatched action into the new state.
 * @param compare an optional `Compare` function. When not defined it uses `Sweety#compare`. When `null` the `Object.is` function applies to compare the states.
 */
export function useSweetyReducer<T, A>(
  store: Sweety<T>,
  reducer: (state: T, action: A) => T,
  compare?: null | Compare<T>,
): [state: T, dispatch: Dispatch<A>] {
  const setState = useSetSweetyState(store, compare)
  const value = useGetSweetyState(store)

  useDebugValue(value)

  return [
    value,
    useEvent((action) => setState((state) => reducer(state, action))),
  ]
}
