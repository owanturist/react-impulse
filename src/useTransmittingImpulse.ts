export { useTransmittingImpulse }

import type { DependencyList } from "./dependencies"
import {
  type Impulse,
  TransmittingImpulse,
  type ReadonlyImpulse,
} from "./Impulse"
import {
  type Compare,
  noop,
  eq,
  useEvent,
  usePermanent,
  useIsomorphicLayoutEffect,
} from "./utils"

function useTransmittingImpulse<T>(
  getter: () => T,
  dependencies: DependencyList,
): ReadonlyImpulse<T>
function useTransmittingImpulse<T>(
  getter: () => T,
  dependencies: DependencyList,
  setter: (value: T) => void,
  compare?: null | Compare<T>,
): Impulse<T>
function useTransmittingImpulse<T>(
  getter: () => T,
  dependencies: DependencyList,
  setter?: (value: T) => void,
  compare?: null | Compare<T>,
): Impulse<T> {
  const stableCompare = useEvent(compare ?? eq)
  const impulse = usePermanent(
    () => new TransmittingImpulse(getter, setter ?? noop, stableCompare),
  )

  useIsomorphicLayoutEffect(
    () => impulse._replaceGetter(getter),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies,
  )

  return impulse
}
