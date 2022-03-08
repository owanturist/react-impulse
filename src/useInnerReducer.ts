import { Dispatch, useRef, useEffect, useCallback } from "react"

import { Compare } from "./utils"
import { InnerStore } from "./InnerStore"
import { useGetInnerState } from "./useGetInnerState"
import { useSetInnerState } from "./useSetInnerState"

/**
 * A hook that is similar to `React.useReducer` but for `InnerStore` instances.
 * It subscribes to the store changes and returns the current value and a function to set the value.
 * The store won't update if the new value is comparably equal to the current value.
 *
 * @param store an `InnerStore` instance.
 * @param reducer a function that transforms the current value and the dispatched action into the new value.
 * @param compare an optional compare function with medium priority.
 * If not defined it uses `InnerStore#compare`.
 * If `null` is passed the strict equality check function (`===`) will be used.
 *
 * @see {@link InnerStore.getState}
 * @see {@link InnerStore.setState}
 * @see {@link InnerStore.subscribe}
 * @see {@link Compare}
 */
export function useInnerReducer<T, A>(
  store: InnerStore<T>,
  reducer: (state: T, action: A) => T,
  compare?: null | Compare<T>,
): [T, Dispatch<A>]

/**
 * A hook that is similar to `React.useReducer` but for `InnerStore` instances.
 * It subscribes to the store changes and returns the current value and a function to set the value.
 * The store won't update if the new value is comparably equal to the current value.
 *
 * @param store an `InnerStore` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
 * @param reducer a function that transforms the current value and the dispatched action into the new value.
 * @param compare an optional compare function with medium priority.
 * If not defined it uses `InnerStore#compare`.
 * If `null` is passed the strict equality check function (`===`) will be used.
 *
 * @see {@link InnerStore.getState}
 * @see {@link InnerStore.setState}
 * @see {@link InnerStore.subscribe}
 * @see {@link Compare}
 */
export function useInnerReducer<T, A>(
  store: null | InnerStore<T>,
  reducer: (state: T, action: A) => T,
  compare?: null | Compare<T>,
): [null | T, Dispatch<A>]

/**
 * A hook that is similar to `React.useReducer` but for `InnerStore` instances.
 * It subscribes to the store changes and returns the current value and a function to set the value.
 * The store won't update if the new value is comparably equal to the current value.
 *
 * @param store an `InnerStore` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
 * @param reducer a function that transforms the current value and the dispatched action into the new value.
 * @param compare an optional compare function with medium priority.
 * If not defined it uses `InnerStore#compare`.
 * If `null` is passed the strict equality check function (`===`) will be used.
 *
 * @see {@link InnerStore.getState}
 * @see {@link InnerStore.setState}
 * @see {@link InnerStore.subscribe}
 * @see {@link Compare}
 */
export function useInnerReducer<T, A>(
  store: undefined | InnerStore<T>,
  reducer: (state: T, action: A) => T,
  compare?: null | Compare<T>,
): [undefined | T, Dispatch<A>]

/**
 * A hook that is similar to `React.useReducer` but for `InnerStore` instances.
 * It subscribes to the store changes and returns the current value and a function to set the value.
 * The store won't update if the new value is comparably equal to the current value.
 *
 * @param store an `InnerStore` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
 * @param reducer a function that transforms the current value and the dispatched action into the new value.
 * @param compare an optional compare function with medium priority.
 * If not defined it uses `InnerStore#compare`.
 * If `null` is passed the strict equality check function (`===`) will be used.
 *
 * @see {@link InnerStore.getState}
 * @see {@link InnerStore.setState}
 * @see {@link InnerStore.subscribe}
 * @see {@link Compare}
 */
export function useInnerReducer<T, A>(
  store: null | undefined | InnerStore<T>,
  reducer: (state: T, action: A) => T,
  compare?: null | Compare<T>,
): [null | undefined | T, Dispatch<A>]

export function useInnerReducer<T, A>(
  store: null | undefined | InnerStore<T>,
  reducer: (state: T, action: A) => T,
  compare?: null | Compare<T>,
): [null | undefined | T, Dispatch<A>] {
  const setState = useSetInnerState(store, compare)
  const reducerRef = useRef(reducer)

  useEffect(() => {
    reducerRef.current = reducer
  }, [reducer])

  return [
    useGetInnerState(store),
    useCallback(
      (action) => setState((state) => reducerRef.current(state, action)),
      [setState],
    ),
  ]
}
