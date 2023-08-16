export { useImpulse }

import { Impulse } from "./Impulse"
import { type Compare, isFunction, usePermanent, useEvent, eq } from "./utils"

/**
 * A hook that initiates a stable (never changing) Impulse without an initial value.
 *
 * @version 1.2.0
 */
function useImpulse<T = undefined>(): Impulse<undefined | T>

/**
 * A hook that initiates a stable (never changing) Impulse.
 *
 * *The initial value is disregarded during subsequent re-renders.*
 *
 * @param valueOrInitValue either an initial value or function returning an initial value during the initial render
 * @param compare an optional `Compare` function that determines whether the value has changed. When not defined or `null` then `Object.is` applies as a fallback.
 *
 * @version 1.0.0
 */
function useImpulse<T>(
  valueOrInitValue: T | ((...args: []) => T),
  compare?: null | Compare<T>,
): Impulse<T>

function useImpulse<T>(
  valueOrInitValue?: T | ((...args: []) => T),
  compare?: null | Compare<undefined | T>,
): Impulse<undefined | T> {
  const stableCompare = useEvent(compare ?? eq)

  return usePermanent(() => {
    const initialValue = isFunction(valueOrInitValue)
      ? valueOrInitValue()
      : valueOrInitValue

    return Impulse.of(initialValue, stableCompare)
  })
}
