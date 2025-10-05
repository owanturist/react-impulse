import { hasProperty } from "~/tools/has-property"
import { isFunction } from "~/tools/is-function"
import { isStrictEqual } from "~/tools/is-strict-equal"

import { DerivedImpulse } from "./derived-impulse"
import { DirectImpulse } from "./direct-impulse"
import type { ImpulseOptions } from "./impulse-options"
import type { ReadableImpulse } from "./readable-impulse"
import type { Scope } from "./scope"
import type { WritableImpulse } from "./writable-impulse"

/**
 * @category Core
 */
export interface ReadonlyImpulse<T> extends ReadableImpulse<T> {
  /**
   * Creates a new Impulse instance out of the current one with the same value.
   *
   * @since 2.0.0
   */
  clone(options?: ImpulseOptions<T>): Impulse<T>

  /**
   * Creates a new Impulse instance out of the current one with the transformed value. Transforming might be handy when cloning mutable values (such as an Impulse).
   *
   * @param transform an optional function that applies to the current value before cloning. It might be handy when cloning mutable values.
   *
   * @since 1.0.0
   */
  clone(
    transform: (value: T, scope: Scope) => T,
    options?: ImpulseOptions<T>,
  ): Impulse<T>
}

/**
 * @category Core
 */
export interface Impulse<T> extends ReadonlyImpulse<T>, WritableImpulse<T> {
  /**
   * Updates the value.
   *
   * @param valueOrTransform either the new value or a function that transforms the current value.
   *
   * @returns `void` to emphasize that Impulses are mutable.
   *
   * @since 1.0.0
   */
  setValue(valueOrTransform: T | ((currentValue: T, scope: Scope) => T)): void
}

/**
 * Creates a new Impulse without an initial value.
 *
 * @since 3.0.0
 *
 * @example
 * const impulse = Impulse<string>()
 * const initiallyUndefined = impulse.getValue(scope) === undefined
 */
export function Impulse<T = undefined>(): Impulse<undefined | T>

/**
 * Creates a new derived ReadonlyImpulse.
 * A derived Impulse is an Impulse that keeps the derived value in memory and updates it whenever the source value changes.
 *
 * @param getter either anything that implements the `ReadableImpulse` interface or a function to read the derived value from the source.
 *
 * @since 3.0.0
 */
export function Impulse<T>(
  getter: ReadableImpulse<T> | ((scope: Scope) => T),
  options?: ImpulseOptions<T>,
): ReadonlyImpulse<T>

/**
 * Creates a new derived Impulse.
 * A derived Impulse is an Impulse that keeps the derived value in memory and updates it whenever the source value changes.
 *
 * @param getter either anything that implements the `ReadableImpulse` interface or a function to read the derived value from the source.
 * @param setter either anything that implements the `WritableImpulse` interface or a function to write the derived value back to the source.
 *
 * @since 3.0.0
 */
export function Impulse<T>(
  getter: ReadableImpulse<T> | ((scope: Scope) => T),
  setter: WritableImpulse<T> | ((value: T, scope: Scope) => void),
  options?: ImpulseOptions<T>,
): Impulse<T>

/**
 * Creates a new Impulse.
 *
 * @param initialValue the initial value.
 *
 * @since 3.0.0
 */
export function Impulse<T>(
  initialValue: T,
  options?: ImpulseOptions<T>,
): Impulse<T>

/**
 * @category Impulse Factory
 */
export function Impulse<T>(
  initialValueOrReadableImpulse?:
    | T
    | ReadableImpulse<T>
    | ((scope: Scope) => T),
  optionsOrWritableImpulse?:
    | ImpulseOptions<T>
    | WritableImpulse<T>
    | ((value: T, scope: Scope) => void),
  optionsOrNothing?: ImpulseOptions<T>,
): Impulse<undefined | T> | Impulse<T> {
  const isGetterFunction = isFunction(initialValueOrReadableImpulse)

  if (
    !isGetterFunction &&
    !hasProperty(initialValueOrReadableImpulse, "getValue")
  ) {
    const options = optionsOrWritableImpulse as
      | undefined
      | ImpulseOptions<undefined | T>

    return new DirectImpulse(
      initialValueOrReadableImpulse,
      options?.compare ?? isStrictEqual,
    )
  }

  const [setter, options] =
    isFunction(optionsOrWritableImpulse) ||
    hasProperty(optionsOrWritableImpulse, "setValue")
      ? [optionsOrWritableImpulse, optionsOrNothing]
      : [undefined, optionsOrWritableImpulse]

  return new DerivedImpulse(
    isGetterFunction
      ? initialValueOrReadableImpulse
      : (scope) => initialValueOrReadableImpulse.getValue(scope),
    isFunction(setter) ? setter : (value) => setter?.setValue(value),
    options?.compare ?? isStrictEqual,
  )
}
