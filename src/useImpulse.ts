import { Impulse } from "./Impulse"
import { Compare, isFunction, usePermanent, useEvent, eq } from "./utils"

/**
 * A hook that initiates a stable (never changing) Impulse.
 *
 * *The initial value is disregarded during subsequent re-renders.*
 *
 * @param valueOrLazyValue either an initial value or function returning an initial value during the initial render
 * @param compare an optional `Compare` function applied as `Impulse#compare`. When not defined or `null` then `Object.is` applies as a fallback.
 *
 * @version 1.0.0
 */
export function useImpulse<T>(
  valueOrLazyValue: T | ((...args: []) => T),
  compare?: null | Compare<T>,
): Impulse<T> {
  const stableCompare = useEvent(compare ?? eq)

  return usePermanent(() => {
    const initialValue = isFunction(valueOrLazyValue)
      ? valueOrLazyValue()
      : valueOrLazyValue

    return Impulse.of(initialValue, stableCompare)
  })
}
