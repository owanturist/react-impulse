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
  isFunction,
} from "./utils"

export interface TransmittingImpulseOptions<T> {
  readonly compare?: null | Compare<T>
}

function useTransmittingImpulse<T>(
  getter: () => T,
  dependencies: DependencyList,
  options?: TransmittingImpulseOptions<T>,
): ReadonlyImpulse<T>
function useTransmittingImpulse<T>(
  getter: () => T,
  dependencies: DependencyList,
  setter: (value: T) => void,
  options?: TransmittingImpulseOptions<T>,
): Impulse<T>
function useTransmittingImpulse<T>(
  getter: () => T,
  dependencies: DependencyList,
  ...rest:
    | []
    | [options?: TransmittingImpulseOptions<T>]
    | [setter: (value: T) => void, options?: TransmittingImpulseOptions<T>]
): Impulse<T> {
  const [setter, options] = isFunction(rest[0])
    ? [rest[0], rest[1]]
    : [noop, rest[0]]

  const stableCompare = useEvent(options?.compare ?? eq)
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
