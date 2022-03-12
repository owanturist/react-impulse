import { useRef, useEffect, useCallback } from "react"

import { Compare, overrideCompare, SetInnerState } from "./utils"
import { InnerStore } from "./InnerStore"

/**
 * A hooks that returns a function to update the store's value.
 * Might be useful when you need a way to update the store's value without subscribing to its changes.
 * The store won't update if the new value is comparably equal to the current value.
 *
 * @param store an `InnerStore` instance but can be `null` or `undefined` as a bypass when a store might be not defined.
 * @param compare an optional compare function with medium priority.
 * If not defined it uses `InnerStore#compare`.
 * The strict equality check function (`===`) will be used if `null`.
 *
 * @see {@link InnerStore.setState}
 * @see {@link Compare}
 * @see {@link SetInnerState}
 */
export function useSetInnerState<T>(
  store: null | undefined | InnerStore<T>,
  compare?: null | Compare<T>,
): SetInnerState<T> {
  const hookLevelCompareRef = useRef(compare)

  useEffect(() => {
    hookLevelCompareRef.current = compare
  }, [compare])

  return useCallback(
    (update, setStateLevelCompare) => {
      store?.setState(
        update,
        overrideCompare(
          overrideCompare(store.compare, hookLevelCompareRef.current),
          setStateLevelCompare,
        ),
      )
    },
    [store],
  )
}
