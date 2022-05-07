import { Dispatch, useDebugValue } from "react"

import type { Compare } from "./utils"
import type { Sweety } from "./Sweety"
import { useGetSweetyState } from "./useGetSweetyState"
import { useSetSweetyState } from "./useSetSweetyState"
import { useEvent } from "./useEvent"

/**
 * A hook that is similar to `React.useReducer` but for `Sweety` instances.
 * It subscribes to the store changes and returns the current value and a function to set the value.
 * The store won't update if the new value is comparably equal to the current value.
 *
 * @param store a `Sweety` instance.
 * @param reducer a function that transforms the current value and the dispatched action into the new value.
 * @param compare an optional compare function with medium priority.
 * If not defined it uses `Sweety#compare`.
 * The strict equality check function (`===`) will be used if `null`.
 *
 * @see {@link Sweety.getState}
 * @see {@link Sweety.setState}
 * @see {@link Sweety.subscribe}
 * @see {@link Compare}
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
