import { Scope, STATIC_SCOPE } from "./Scope"
import { Impulse } from "./Impulse"
import { Compare, isFunction, usePermanent, useEvent, eq } from "./utils"

/**
 * A hook that initiates a stable (never changing) Impulse without an initial value.
 *
 * @version 1.2.0
 */
export function useImpulse<T = undefined>(): Impulse<undefined | T>

/**
 * A hook that initiates a stable (never changing) Impulse.
 *
 * *The initial value is disregarded during subsequent re-renders.*
 *
 * @param valueOrInitValue either an initial value or function returning an initial value during the initial render
 * @param compare an optional `Compare` function applied as `Impulse#compare`. When not defined or `null` then `Object.is` applies as a fallback.
 *
 * @version 1.0.0
 */
export function useImpulse<T>(
  valueOrInitValue: T | ((scope: Scope) => T),
  compare?: null | Compare<T>,
): Impulse<T>

// Implements 👆
export function useImpulse<T>(
  valueOrInitValue?: T | ((scope: Scope) => T),
  compare?: null | Compare<undefined | T>,
): Impulse<undefined | T> {
  const stableCompare = useEvent(compare ?? eq)

  return usePermanent(() => {
    const initialValue = isFunction(valueOrInitValue)
      ? valueOrInitValue(STATIC_SCOPE)
      : valueOrInitValue

    return Impulse.of(initialValue, stableCompare)
  })
}
