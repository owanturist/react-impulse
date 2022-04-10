import { Dispatch, useRef, useEffect, useCallback } from "react"

import { Compare } from "./utils"
import { Sweety } from "./Sweety"
import { useGetSweetyState } from "./useGetSweetyState"
import { useSetSweetyState } from "./useSetSweetyState"

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
): [T, Dispatch<A>]

/**
 * A hook that is similar to `React.useReducer` but for `Sweety` instances.
 * It subscribes to the store changes and returns the current value and a function to set the value.
 * The store won't update if the new value is comparably equal to the current value.
 *
 * @param store a `Sweety` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
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
  store: null | Sweety<T>,
  reducer: (state: T, action: A) => T,
  compare?: null | Compare<T>,
): [null | T, Dispatch<A>]

/**
 * A hook that is similar to `React.useReducer` but for `Sweety` instances.
 * It subscribes to the store changes and returns the current value and a function to set the value.
 * The store won't update if the new value is comparably equal to the current value.
 *
 * @param store a `Sweety` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
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
  store: undefined | Sweety<T>,
  reducer: (state: T, action: A) => T,
  compare?: null | Compare<T>,
): [undefined | T, Dispatch<A>]

/**
 * A hook that is similar to `React.useReducer` but for `Sweety` instances.
 * It subscribes to the store changes and returns the current value and a function to set the value.
 * The store won't update if the new value is comparably equal to the current value.
 *
 * @param store a `Sweety` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
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
  store: null | undefined | Sweety<T>,
  reducer: (state: T, action: A) => T,
  compare?: null | Compare<T>,
): [state: null | undefined | T, dispatch: Dispatch<A>]

export function useSweetyReducer<T, A>(
  store: null | undefined | Sweety<T>,
  reducer: (state: T, action: A) => T,
  compare?: null | Compare<T>,
): [state: null | undefined | T, dispatch: Dispatch<A>] {
  const setState = useSetSweetyState(store, compare)
  const reducerRef = useRef(reducer)

  useEffect(() => {
    reducerRef.current = reducer
  }, [reducer])

  return [
    useGetSweetyState(store),
    useCallback(
      (action) => setState((state) => reducerRef.current(state, action)),
      [setState],
    ),
  ]
}
