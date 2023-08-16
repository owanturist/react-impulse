export { useImpulse }

import { Impulse, type ImpulseOptions } from "./Impulse"
import { isFunction, usePermanent, useEvent, eq } from "./utils"

/**
 * A hook that initiates a stable (never changing) Impulse without an initial value.
 *
 * @version 1.2.0
 */
function useImpulse<T = undefined>(): Impulse<undefined | T>

/**
 * A hook that initiates a stable (never changing) Impulse.
 *
 * *The initial value is disregarded during subsequent re-renders but compare function is not - it uses the latest function passed to the hook.*
 *
 * @param valueOrInitValue either an initial value or function returning an initial value during the initial render
 * @param options optional `ImpulseOptions`.
 *
 * @version 1.0.0
 */
function useImpulse<T>(
  valueOrInitValue: T | ((...args: []) => T),
  options?: ImpulseOptions<T>,
): Impulse<T>

function useImpulse<T>(
  valueOrInitValue?: T | ((...args: []) => T),
  { compare }: ImpulseOptions<undefined | T> = {},
): Impulse<undefined | T> {
  const stableCompare = useEvent(compare ?? eq)

  return usePermanent(() => {
    const initialValue = isFunction(valueOrInitValue)
      ? valueOrInitValue()
      : valueOrInitValue

    return Impulse.of(initialValue, { compare: stableCompare })
  })
}
