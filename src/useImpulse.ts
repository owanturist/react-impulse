import { DependencyList, useCallback } from "./dependencies"
import { Scope, STATIC_SCOPE } from "./Scope"
import { Impulse } from "./Impulse"
import {
  Compare,
  isEqual,
  isFunction,
  useEvent,
  usePermanent,
  useIsomorphicEffect,
} from "./utils"
import { useScope } from "./useScope"

function useTransmitImpulse<T>(
  getter: (scope: Scope) => T,
  dependencies: DependencyList,
  setter: (value: T, prevValue: T) => void,
  compare?: null | Compare<T>,
): Impulse<T> {
  const compareStable = useEvent(compare ?? isEqual)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getterValue = useScope(useCallback(getter, dependencies), compareStable)
  const impulse = usePermanent(() => Impulse.of(getterValue, compareStable))
  const impulseValue = useScope(
    useCallback((scope: Scope) => impulse.getValue(scope), [impulse]),
    compareStable,
  )
  useIsomorphicEffect(() => {
    impulse.setValue(getterValue)
  }, [impulse, getterValue])

  useIsomorphicEffect(() => {
    if (!impulse.compare(impulseValue, getterValue)) {
      setter(impulseValue, getterValue)
    }
    // it does not care about neither `getterValue` nor `setter` dependencies because only impulseValue changes matter
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [impulse, impulseValue])

  return impulse
}

/**
 *
 * @param valueOrLazyValue bla bla
 * @param compare
 * @returns
 */
function useInitImpulse<T>(
  valueOrLazyValue: T | ((scope: Scope) => T),
  compare?: null | Compare<T>,
): Impulse<T> {
  const compareStable = useEvent(compare ?? isEqual)

  return usePermanent(() => {
    const initialValue = isFunction(valueOrLazyValue)
      ? valueOrLazyValue(STATIC_SCOPE)
      : valueOrLazyValue

    return Impulse.of(initialValue, compareStable)
  })
}

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
  ...args: Parameters<typeof useInitImpulse<T>>
): Impulse<T>
export function useImpulse<T>(
  ...args: Parameters<typeof useTransmitImpulse<T>>
): Impulse<T>
export function useImpulse<T>(
  ...args:
    | Parameters<typeof useInitImpulse<T>>
    | Parameters<typeof useTransmitImpulse<T>>
): Impulse<T> {
  if (args.length < 3) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useInitImpulse(...(args as Parameters<typeof useInitImpulse<T>>))
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useTransmitImpulse(
    ...(args as Parameters<typeof useTransmitImpulse<T>>),
  )
}
