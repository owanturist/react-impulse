import { DependencyList } from "./dependencies"
import { Scope } from "./Scope"
import { Impulse, ReadonlyImpulse, TransmittingImpulse } from "./Impulse"
import { usePermanent, useIsomorphicEffect, noop, useEvent } from "./utils"

export function useTransmittingImpulse<T>(
  getter: (scope: Scope) => T,
  dependencies: DependencyList,
): ReadonlyImpulse<T>
export function useTransmittingImpulse<T>(
  getter: (scope: Scope) => T,
  dependencies: DependencyList,
  setter: (value: T, scope: Scope) => void,
): Impulse<T>
export function useTransmittingImpulse<T>(
  getter: (scope: Scope) => T,
  dependencies: DependencyList,
  setter?: (value: T, scope: Scope) => void,
): Impulse<T> {
  const stableSetter = useEvent(setter ?? noop)
  const impulse = usePermanent(
    () => new TransmittingImpulse(getter, stableSetter),
  )

  useIsomorphicEffect(
    () => impulse.replaceGetter(getter),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies,
  )

  return impulse
}
