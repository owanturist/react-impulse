import { useCallback } from "react"
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/with-selector"

import { Sweety } from "./Sweety"
import { Compare, isEqual, noop, overrideCompare } from "./utils"

/**
 * A hooks that subscribes to the store's changes and returns the current value.
 *
 * @param store a `Sweety` instance.
 *
 * @see {@link Sweety.getState}
 * @see {@link Sweety.subscribe}
 */
export function useGetSweetyState<T, R = T>(
  store: Sweety<T>,
  selector?: (value: T) => R,
  compare?: null | Compare<R>,
): R

/**
 * A hooks that subscribes to the store's changes and returns the current value.
 *
 * @param store a `Sweety` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
 *
 * @see {@link Sweety.getState}
 * @see {@link Sweety.subscribe}
 */
export function useGetSweetyState<T, R = T>(
  store: null | Sweety<T>,
  selector?: (value: T) => R,
  compare?: null | Compare<R>,
): null | R

/**
 * A hooks that subscribes to the store's changes and returns the current value.
 *
 * @param store a `Sweety` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
 *
 * @see {@link Sweety.getState}
 * @see {@link Sweety.subscribe}
 */
export function useGetSweetyState<T, R = T>(
  store: undefined | Sweety<T>,
  selector?: (value: T) => R,
  compare?: null | Compare<R>,
): undefined | R

/**
 * A hooks that subscribes to the store's changes and returns the current value.
 *
 * @param store a `Sweety` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
 *
 * @see {@link Sweety.getState}
 * @see {@link Sweety.subscribe}
 */
export function useGetSweetyState<T, R = T>(
  store: null | undefined | Sweety<T>,
  selector?: (value: T) => R,
  compare?: null | Compare<R>,
): null | undefined | R

export function useGetSweetyState<T, R = T>(
  store: null | undefined | Sweety<T>,
  selector?: (value: T) => R,
  compare?: null | Compare<R>,
): null | undefined | R {
  const finalCompare = overrideCompare(isEqual, compare)
  const getState = useCallback(() => {
    if (store == null) {
      return store
    }

    return store.getState()
  }, [store])

  return useSyncExternalStoreWithSelector(
    useCallback(
      (cb) => {
        if (store == null) {
          return noop
        }

        return store.subscribe(cb)
      },
      [store],
    ),
    getState,
    getState,
    useCallback(
      (state) => {
        if (state == null || selector == null) {
          return state as unknown as R
        }

        return selector(state)
      },
      [selector],
    ),
    useCallback(
      (prev: R, next: R) => {
        if (prev != null && next != null) {
          return finalCompare(prev, next)
        }

        return prev !== next
      },
      [finalCompare],
    ),
  )
}
