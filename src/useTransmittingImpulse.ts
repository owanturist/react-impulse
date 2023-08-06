import type { DependencyList } from "./dependencies"
import { type Impulse, TransmittingImpulse } from "./Impulse"
import {
  type Compare,
  eq,
  useEvent,
  usePermanent,
  useIsomorphicLayoutEffect,
} from "./utils"

export function useTransmittingImpulse<T>(
  getter: () => T,
  dependencies: DependencyList,
  setter: (value: T) => void,
  compare?: null | Compare<T>,
): Impulse<T> {
  const stableCompare = useEvent(compare ?? eq)
  const impulse = usePermanent(
    () => new TransmittingImpulse(getter, setter, stableCompare),
  )

  useIsomorphicLayoutEffect(
    () => impulse._replaceGetter(getter),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies,
  )

  return impulse
}
