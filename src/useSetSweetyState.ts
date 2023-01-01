import { Compare, overrideCompare, SetSweetyState, useEvent } from "./utils"
import type { Sweety } from "./Sweety"

/**
 * A hook that returns a function to update the `Sweety` instance state. Might be useful when you need a way to update the state without subscribing to its changes.
 *
 * @param sweety a `Sweety` instance.
 * @param compare an optional `Compare` function. When not defined it uses `Sweety#compare`. When `null` the `Object.is` function applies to compare the states.
 */
export function useSetSweetyState<T>(
  sweety: Sweety<T>,
  compare?: null | Compare<T>,
): SetSweetyState<T> {
  return useEvent((update, setStateLevelCompare) => {
    const finalCompare = overrideCompare(
      sweety.compare,
      compare,
      setStateLevelCompare,
    )

    sweety.setState(update, finalCompare)
  })
}
