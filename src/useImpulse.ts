import { Impulse, type ImpulseOptions } from "./Impulse"
import { STATIC_SCOPE, type Scope } from "./Scope"
import {
  isFunction,
  usePermanent,
  useStableCallback,
  eq,
  type Func,
} from "./utils"

/**
 * A hook that initiates a stable (never changing) Impulse without an initial value.
 *
 * @version 1.2.0
 */
export function useImpulse<T = undefined>(): Impulse<undefined | T>

/**
 * A hook that initiates a stable (never changing) Impulse.
 *
 * *The initial value is disregarded during subsequent re-renders but compare function is not - it uses the latest function passed to the hook.*
 *
 * @param valueOrInitValue either an initial value or function returning an initial value during the initial render
 * @param options optional `ImpulseOptions`.
 * @param options.compare when not defined or `null` then `Object.is` applies as a fallback.
 *
 * @version 1.0.0
 */
export function useImpulse<T>(
  valueOrInitValue: T | ((scope: Scope) => T),
  options?: ImpulseOptions<T>,
): Impulse<T>

export function useImpulse<T>(
  valueOrInitValue?: T | Func<[Scope], T>,
  options?: ImpulseOptions<undefined | T>,
): Impulse<undefined | T> {
  const stableCompare = useStableCallback(
    (prev: undefined | T, next: undefined | T, scope: Scope) => {
      const compare = options?.compare ?? eq

      return compare(prev, next, scope)
    },
  )

  return usePermanent(() => {
    const initialValue = isFunction(valueOrInitValue)
      ? valueOrInitValue(STATIC_SCOPE)
      : valueOrInitValue

    return Impulse.of(initialValue, { compare: stableCompare })
  })
}
