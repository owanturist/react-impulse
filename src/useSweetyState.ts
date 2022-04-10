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
 *
 * @see {@link Sweety.getState}
 * @see {@link Sweety.setState}
 * @see {@link Sweety.subscribe}
 * @see {@link useGetSweetyState}
 * @see {@link useSetSweetyState}
 * @see {@link Compare}
 */
export function useSweetyState<T>(
  store: Sweety<T>,
  compare?: null | Compare<T>,
): [state: T, setState: SetSweetyState<T>]

/**
 * The hook that is similar to `React.useState` but for `Sweety` instances.
 * It subscribes to the store changes and returns the current value and a function to set the value.
 * The store won't update if the new value is comparably equal to the current value.
 *
 * @param store a `Sweety` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
 * @param compare an optional compare function with medium priority.
 * If not defined it uses `Sweety#compare`.
 * The strict equality check function (`===`) will be used if `null`.
 *
 * @see {@link Sweety.getState}
 * @see {@link Sweety.setState}
 * @see {@link Sweety.subscribe}
 * @see {@link useGetSweetyState}
 * @see {@link useSetSweetyState}
 * @see {@link Compare}
 */
export function useSweetyState<T>(
  store: null | Sweety<T>,
  compare?: null | Compare<T>,
): [state: null | T, setState: SetSweetyState<T>]

/**
 * A hook that is similar to `React.useState` but for `Sweety` instances.
 * It subscribes to the store changes and returns the current value and a function to set the value.
 * The store won't update if the new value is comparably equal to the current value.
 *
 * @param store a `Sweety` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
 * @param compare an optional compare function with medium priority.
 * If not defined it uses `Sweety#compare`.
 * The strict equality check function (`===`) will be used if `null`.
 *
 * @see {@link Sweety.getState}
 * @see {@link Sweety.setState}
 * @see {@link Sweety.subscribe}
 * @see {@link useGetSweetyState}
 * @see {@link useSetSweetyState}
 * @see {@link Compare}
 */
export function useSweetyState<T>(
  store: undefined | Sweety<T>,
  compare?: null | Compare<T>,
): [state: undefined | T, setState: SetSweetyState<T>]

/**
 * A hook that is similar to `React.useState` but for `Sweety` instances.
 * It subscribes to the store changes and returns the current value and a function to set the value.
 * The store won't update if the new value is comparably equal to the current value.
 *
 * @param store a `Sweety` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
 * @param compare an optional compare function with medium priority.
 * If not defined it uses `Sweety#compare`.
 * The strict equality check function (`===`) will be used if `null`.
 *
 * @see {@link Sweety.getState}
 * @see {@link Sweety.setState}
 * @see {@link Sweety.subscribe}
 * @see {@link useGetSweetyState}
 * @see {@link useSetSweetyState}
 * @see {@link Compare}
 */
export function useSweetyState<T>(
  store: null | undefined | Sweety<T>,
  compare?: null | Compare<T>,
): [state: null | undefined | T, setState: SetSweetyState<T>]

export function useSweetyState<T>(
  store: null | undefined | Sweety<T>,
  compare?: null | Compare<T>,
): [state: null | undefined | T, setState: SetSweetyState<T>] {
  const value = useGetSweetyState(store)

  useDebugValue(value)

  return [value, useSetSweetyState(store, compare)]
}
