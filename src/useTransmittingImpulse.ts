import { DependencyList } from "./dependencies"
import { Scope } from "./Scope"
import { Impulse, TransmittingImpulse } from "./Impulse"
import {
  Compare,
  eq,
  useEvent,
  usePermanent,
  useIsomorphicEffect,
} from "./utils"

export function useTransmittingImpulse<T>(
  getter: (scope: Scope) => T,
  dependencies: DependencyList,
  setter: (value: T, scope: Scope) => void,
  compare?: null | Compare<T>,
): Impulse<T> {
  const stableCompare = useEvent(compare ?? eq)
  const impulse = usePermanent(
    () => new TransmittingImpulse(getter, setter, stableCompare),
  )

  useIsomorphicEffect(
    () => impulse.replaceGetter(getter),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies,
  )

  return impulse
}
