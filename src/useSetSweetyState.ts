import { Compare, overrideCompare, SetSweetyState } from "./utils"
import type { Sweety } from "./Sweety"
import { useEvent } from "./useEvent"

/**
 * A hooks that returns a function to update the store's value.
 * Might be useful when you need a way to update the store's value without subscribing to its changes.
 * The store won't update if the new value is comparably equal to the current value.
 *
 * @param store a `Sweety` instance.
 * @param compare an optional compare function with medium priority.
 * If not defined it uses `Sweety#compare`.
 * The strict equality check function (`===`) will be used if `null`.
 *
 * @see {@link Sweety.setState}
 * @see {@link Compare}
 * @see {@link SetSweetyState}
 */
export function useSetSweetyState<T>(
  store: Sweety<T>,
  compare?: null | Compare<T>,
): SetSweetyState<T> {
  return useEvent((update, setStateLevelCompare) => {
    const finalCompare = overrideCompare(
      overrideCompare(store.compare, compare),
      setStateLevelCompare,
    )

    store.setState(update, finalCompare)
  })
}
