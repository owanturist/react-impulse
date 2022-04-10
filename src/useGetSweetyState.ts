import { useCallback, useDebugValue } from "react"
import { useSyncExternalStore } from "use-sync-external-store/shim"

import { noop } from "./utils"
import type { Sweety } from "./Sweety"

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
  const value = useSyncExternalStore(
    useCallback(
      (onStoreChange) => {
        return store == null ? noop : store.subscribe(onStoreChange)
      },
      [store],
    ),
    useCallback(() => {
      if (store == null) {
        return store
      }

      return store.getState()
    }, [store]),
  )

  useDebugValue(value)

  return value
}
