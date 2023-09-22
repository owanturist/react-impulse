export { useTransmittingImpulse }

import type { DependencyList } from "./dependencies"
import {
  Impulse,
  type TransmittingImpulse,
  type ReadonlyImpulse,
  type TransmittingImpulseOptions,
} from "./Impulse"
import {
  noop,
  eq,
  useEvent,
  usePermanent,
  useIsomorphicLayoutEffect,
  isFunction,
} from "./utils"

/**
 * A hook that initialize a stable (never changing) transmitting ReadonlyImpulse.
 * A transmitting impulse is an impulse that does not have its own value but reads it from the external source.
 *
 * @param getter the function to read the transmitting value from the source.
 * @param dependencies a list of values triggering the re-read of the transmitting value.
 * @param options optional `TransmittingImpulseOptions`.
 * @param options.compare when not defined or `null` then `Object.is` applies as a fallback.
 *
 * @version 2.0.0
 */
function useTransmittingImpulse<T>(
  getter: () => T,
  dependencies: DependencyList,
  options?: TransmittingImpulseOptions<T>,
): ReadonlyImpulse<T>

/**
 * A hook that initialize a stable (never changing) transmitting Impulse.
 * A transmitting impulse is an impulse that does not have its own value but reads it from the external source and writes it back.
 *
 * @param getter the function to read the transmitting value from the source.
 * @param setter the function to write the transmitting value back to the source.
 * @param dependencies a list of values triggering the re-read of the transmitting value.
 * @param options optional `TransmittingImpulseOptions`.
 * @param options.compare when not defined or `null` then `Object.is` applies as a fallback.
 *
 * @version 2.0.0
 */
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
    | [options?: TransmittingImpulseOptions<T>]
    | [setter: (value: T) => void, options?: TransmittingImpulseOptions<T>]
): Impulse<T> {
  const [setter, options] = isFunction(rest[0])
    ? [rest[0], rest[1]]
    : [noop, rest[0]]

  const stableSetter = useEvent(setter)
  const stableCompare = useEvent(options?.compare ?? eq)
  const impulse = usePermanent(() => {
    return Impulse.transmit(getter, stableSetter, {
      compare: stableCompare,
    })
  }) as TransmittingImpulse<T>

  useIsomorphicLayoutEffect(
    () => impulse._replaceGetter(getter),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies,
  )

  return impulse
}
