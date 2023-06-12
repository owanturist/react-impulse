import { Scope, STATIC_SCOPE } from "./Scope"
import { Impulse } from "./Impulse"
import { Compare, isFunction, useEvent, usePermanent } from "./utils"

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
export function useImpulse<T = undefined>(): Impulse<undefined | T>
export function useImpulse<T>(
  valueOrLazyValue: T | ((scope: Scope) => T),
  compare?: null | Compare<T>,
): Impulse<T>
export function useImpulse<T>(
  valueOrLazyValue?: T | ((scope: Scope) => T),
  compare?: null | Compare<undefined | T>,
): Impulse<undefined | T> {
  const compareStable = useEvent(compare ?? Object.is)

  return usePermanent(() => {
    const initialValue = isFunction(valueOrLazyValue)
      ? valueOrLazyValue(STATIC_SCOPE)
      : valueOrLazyValue

    return Impulse.of(initialValue, compareStable)
  })
}
