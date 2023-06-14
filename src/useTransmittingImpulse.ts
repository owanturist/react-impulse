import { DependencyList, useCallback } from "./dependencies"
import { Scope } from "./Scope"
import { Impulse } from "./Impulse"
import {
  Compare,
  isEqual,
  useEvent,
  usePermanent,
  useIsomorphicEffect,
} from "./utils"
import { useScope } from "./useScope"

export function useTransmittingImpulse<T>(
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
