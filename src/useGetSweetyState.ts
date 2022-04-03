import { useCallback } from "react"
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/with-selector"

import { Sweety } from "./Sweety"
import { identity, isEqual, noop } from "./utils"

// TODO add selector to the hook

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
    identity,
    isEqual,
  )
}
