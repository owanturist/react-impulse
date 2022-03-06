import { Dispatch, SetStateAction, useRef, useEffect, useCallback } from "react"

import { Compare, isEqual } from "./utils"
import { InnerStore } from "./InnerStore"

export type SetInnerState<T> = Dispatch<SetStateAction<T>>

/**
 * A hooks that returns a function to update the store's value.
 * Might be useful when you need a way to update the store's value without subscribing to its changes.
 * The store won't update if the new value is comparably equal to the current value.
 *
 * @param store an `InnerStore` instance but can be `null` or `undefined` as a bypass when a store might be not defined.
 * @param compare an optional compare function. Applies strict check (`===`) by default or when `null`.
 *
 * @see {@link InnerStore.setState}
 * @see {@link Compare}
 */
export function useSetInnerState<T>(
  store: null | undefined | InnerStore<T>,
  compare?: null | Compare<T>,
): SetInnerState<T> {
  const finalCompare = compare ?? isEqual
  const compareRef = useRef(finalCompare)

  useEffect(() => {
    compareRef.current = finalCompare
  }, [finalCompare])

  return useCallback(
    (update) => store?.setState(update, compareRef.current),
    [store],
  )
}
