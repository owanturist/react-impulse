import { SetStateAction, useRef, useEffect, useCallback } from "react"

import { Compare, overrideCompare } from "./utils"
import { InnerStore } from "./InnerStore"

/**
 * The setState function that can be used to set the state of the store.
 *
 * @param valueOrTransform either the new value or a function that will be applied to the current value before setting.
 *
 * @param compare an optional compare function with the highest priority to use for this call only.
 * If not defined it uses `compare` from `useSetInnerState` or `useInnerState`.
 * If `null` is passed the strict equality check function (`===`) will be used.
 *
 * @example
 * import { useSetInnerState, useInnerState } from "use-inner-state"
 *
 * const setState = useSetInnerState(store)
 * // or
 * const [state, setState] = useInnerState(store)
 *
 * @see {@link Compare}
 */
export type SetInnerState<T> = (
  valueOrTransform: SetStateAction<T>,
  compare?: null | Compare<T>,
) => void

/**
 * A hooks that returns a function to update the store's value.
 * Might be useful when you need a way to update the store's value without subscribing to its changes.
 * The store won't update if the new value is comparably equal to the current value.
 *
 * @param store an `InnerStore` instance but can be `null` or `undefined` as a bypass when a store might be not defined.
 * @param compare an optional compare function with medium priority.
 * If not defined it uses `InnerStore#compare`.
 * If `null` is passed the strict equality check function (`===`) will be used.
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
