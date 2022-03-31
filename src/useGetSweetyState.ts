import { useCallback, useSyncExternalStore } from "react"

import { Sweety } from "./Sweety"

/**
 * A hooks that subscribes to the store's changes and returns the current value.
 *
 * @param store a `Sweety` instance.
 *
 * @see {@link Sweety.getState}
 * @see {@link Sweety.subscribe}
 */
export function useGetSweetyState<T>(store: Sweety<T>): T

/**
 * A hooks that subscribes to the store's changes and returns the current value.
 *
 * @param store a `Sweety` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
 *
 * @see {@link Sweety.getState}
 * @see {@link Sweety.subscribe}
 */
export function useGetSweetyState<T>(store: null | Sweety<T>): null | T

/**
 * A hooks that subscribes to the store's changes and returns the current value.
 *
 * @param store a `Sweety` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
 *
 * @see {@link Sweety.getState}
 * @see {@link Sweety.subscribe}
 */
export function useGetSweetyState<T>(
  store: undefined | Sweety<T>,
): undefined | T

/**
 * A hooks that subscribes to the store's changes and returns the current value.
 *
 * @param store a `Sweety` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
 *
 * @see {@link Sweety.getState}
 * @see {@link Sweety.subscribe}
 */
export function useGetSweetyState<T>(
  store: null | undefined | Sweety<T>,
): null | undefined | T

export function useGetSweetyState<T>(
  store: null | undefined | Sweety<T>,
): null | undefined | T {
  return useSyncExternalStore(
    useCallback((cb) => store?.subscribe(cb), [store]),
    useCallback(() => store && store.getState(), [store]),
  )
}
