import { useRef, useEffect, useCallback } from "react"

import { Compare, overrideCompare, SetSweetyState } from "./utils"
import type { Sweety } from "./Sweety"

/**
 * A hooks that returns a function to update the store's value.
 * Might be useful when you need a way to update the store's value without subscribing to its changes.
 * The store won't update if the new value is comparably equal to the current value.
 *
 * @param store a `Sweety` instance but can be `null` or `undefined` as a bypass when a store might be not defined.
 * @param compare an optional compare function with medium priority.
 * If not defined it uses `Sweety#compare`.
 * The strict equality check function (`===`) will be used if `null`.
 *
 * @see {@link Sweety.setState}
 * @see {@link Compare}
 * @see {@link SetSweetyState}
 */
export function useSetSweetyState<T>(
  store: null | undefined | Sweety<T>,
  compare?: null | Compare<T>,
): SetSweetyState<T> {
  const storeRef = useRef(store)
  const hookLevelCompareRef = useRef(compare)

  useEffect(() => {
    storeRef.current = store
    hookLevelCompareRef.current = compare
  }, [store, compare])

  return useCallback((update, setStateLevelCompare) => {
    const currentStore = storeRef.current

    if (currentStore != null) {
      const finalCompare = overrideCompare(
        overrideCompare(currentStore.compare, hookLevelCompareRef.current),
        setStateLevelCompare,
      )

      currentStore.setState(update, finalCompare)
    }
  }, [])
}
