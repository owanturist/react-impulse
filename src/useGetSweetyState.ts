import { useEffect, useReducer } from "react"

import { modInc } from "./utils"
import { InnerStore } from "./InnerStore"

/**
 * A hooks that subscribes to the store's changes and returns the current value.
 *
 * @param store an `InnerStore` instance.
 *
 * @see {@link InnerStore.getState}
 * @see {@link InnerStore.subscribe}
 */
export function useGetInnerState<T>(store: InnerStore<T>): T

/**
 * A hooks that subscribes to the store's changes and returns the current value.
 *
 * @param store an `InnerStore` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
 *
 * @see {@link InnerStore.getState}
 * @see {@link InnerStore.subscribe}
 */
export function useGetInnerState<T>(store: null | InnerStore<T>): null | T

/**
 * A hooks that subscribes to the store's changes and returns the current value.
 *
 * @param store an `InnerStore` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
 *
 * @see {@link InnerStore.getState}
 * @see {@link InnerStore.subscribe}
 */
export function useGetInnerState<T>(
  store: undefined | InnerStore<T>,
): undefined | T

/**
 * A hooks that subscribes to the store's changes and returns the current value.
 *
 * @param store an `InnerStore` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
 *
 * @see {@link InnerStore.getState}
 * @see {@link InnerStore.subscribe}
 */
export function useGetInnerState<T>(
  store: null | undefined | InnerStore<T>,
): null | undefined | T

export function useGetInnerState<T>(
  store: null | undefined | InnerStore<T>,
): null | undefined | T {
  const [, render] = useReducer(modInc, 0)

  useEffect(() => {
    return store?.subscribe(render)
  }, [store])

  if (store == null) {
    return store
  }

  return store.getState()
}
