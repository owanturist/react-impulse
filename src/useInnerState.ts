import { Compare } from "./utils"
import { InnerStore } from "./InnerStore"
import { useGetInnerState } from "./useGetInnerState"
import { SetInnerState, useSetInnerState } from "./useSetInnerState"

/**
 * A hook that is similar to `React.useState` but for `InnerStore` instances.
 * It subscribes to the store changes and returns the current value and a function to set the value.
 * The store won't update if the new value is comparably equal to the current value.
 *
 * @param store an `InnerStore` instance.
 * @param compare an optional compare function with medium priority.
 * If not defined it uses `InnerStore#compare`.
 * If `null` is passed the strict equality check function (`===`) will be used.
 *
 * @see {@link InnerStore.getState}
 * @see {@link InnerStore.setState}
 * @see {@link InnerStore.subscribe}
 * @see {@link useGetInnerState}
 * @see {@link useSetInnerState}
 * @see {@link Compare}
 */
export function useInnerState<T>(
  store: InnerStore<T>,
  compare?: null | Compare<T>,
): [T, SetInnerState<T>]

/**
 * The hook that is similar to `React.useState` but for `InnerStore` instances.
 * It subscribes to the store changes and returns the current value and a function to set the value.
 * The store won't update if the new value is comparably equal to the current value.
 *
 * @param store an `InnerStore` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
 * @param compare an optional compare function with medium priority.
 * If not defined it uses `InnerStore#compare`.
 * If `null` is passed the strict equality check function (`===`) will be used.
 *
 * @see {@link InnerStore.getState}
 * @see {@link InnerStore.setState}
 * @see {@link InnerStore.subscribe}
 * @see {@link useGetInnerState}
 * @see {@link useSetInnerState}
 * @see {@link Compare}
 */
export function useInnerState<T>(
  store: null | InnerStore<T>,
  compare?: null | Compare<T>,
): [null | T, SetInnerState<T>]

/**
 * A hook that is similar to `React.useState` but for `InnerStore` instances.
 * It subscribes to the store changes and returns the current value and a function to set the value.
 * The store won't update if the new value is comparably equal to the current value.
 *
 * @param store an `InnerStore` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
 * @param compare an optional compare function with medium priority.
 * If not defined it uses `InnerStore#compare`.
 * If `null` is passed the strict equality check function (`===`) will be used.
 *
 * @see {@link InnerStore.getState}
 * @see {@link InnerStore.setState}
 * @see {@link InnerStore.subscribe}
 * @see {@link useGetInnerState}
 * @see {@link useSetInnerState}
 * @see {@link Compare}
 */
export function useInnerState<T>(
  store: undefined | InnerStore<T>,
  compare?: null | Compare<T>,
): [undefined | T, SetInnerState<T>]

/**
 * A hook that is similar to `React.useState` but for `InnerStore` instances.
 * It subscribes to the store changes and returns the current value and a function to set the value.
 * The store won't update if the new value is comparably equal to the current value.
 *
 * @param store an `InnerStore` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
 * @param compare an optional compare function with medium priority.
 * If not defined it uses `InnerStore#compare`.
 * If `null` is passed the strict equality check function (`===`) will be used.
 *
 * @see {@link InnerStore.getState}
 * @see {@link InnerStore.setState}
 * @see {@link InnerStore.subscribe}
 * @see {@link useGetInnerState}
 * @see {@link useSetInnerState}
 * @see {@link Compare}
 */
export function useInnerState<T>(
  store: null | undefined | InnerStore<T>,
  compare?: null | Compare<T>,
): [null | undefined | T, SetInnerState<T>]

export function useInnerState<T>(
  store: null | undefined | InnerStore<T>,
  compare?: null | Compare<T>,
): [null | undefined | T, SetInnerState<T>] {
  return [useGetInnerState(store), useSetInnerState(store, compare)]
}
