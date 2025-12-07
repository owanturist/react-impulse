import { hasProperty } from "~/tools/has-property"
import { isFunction } from "~/tools/is-function"
import { isStrictEqual } from "~/tools/is-strict-equal"

import type { Equal } from "./equal"
import type { ImpulseOptions } from "./impulse-options"
import type { ReadableImpulse } from "./readable-impulse"
import type { WritableImpulse } from "./writable-impulse"
import type { BaseImpulse } from "./_internal/base-impulse"
import { DerivedImpulse } from "./_internal/derived-impulse"
import { Impulse as ImpulseImpl } from "./_internal/impulse"
import type { Scope } from "./_internal/scope"

type Impulse<T> = BaseImpulse<T>

type ReadonlyImpulse<T> = Omit<Impulse<T>, "update">

/**
 * Creates a new Impulse without an initial value.
 *
 * @template TValue the type of the Impulse value.
 *
 * @version 1.0.0
 *
 * @example
 * const impulse = Impulse<string>()
 * const initiallyUndefined = impulse.read(scope) === undefined
 */
function Impulse<TValue = undefined>(): Impulse<undefined | TValue>

/**
 * Creates a new derived {@link ReadonlyImpulse}.
 * A derived Impulse is an Impulse that keeps the derived value in memory and updates it whenever the source value changes.
 *
 * @template TDerivedValue the type of the derived Impulse value.
 *
 * @param getter either anything that implements the {@link ReadableImpulse} interface or a function to read the derived value from the source.
 * @param options optional {@link ImpulseOptions}.
 * @param options.equals the {@link Equal} function that determines whether or not a new Impulse's value replaces the current one. Defaults to {@link Object.is}.
 *
 * @returns a new {@link ReadonlyImpulse}.
 *
 * @version 1.0.0
 */
function Impulse<TDerivedValue>(
  getter: ReadableImpulse<TDerivedValue> | ((scope: Scope) => TDerivedValue),
  options?: ImpulseOptions<TDerivedValue>,
): ReadonlyImpulse<TDerivedValue>

/**
 * Creates a new derived {@link Impulse}.
 * A derived Impulse is an Impulse that keeps the derived value in memory and updates it whenever the source value changes.
 *
 * @template TDerivedValue the type of the derived Impulse value.
 *
 * @param getter either anything that implements the {@link ReadableImpulse} interface or a function to read the derived value from the source.
 * @param setter either anything that implements the {@link WritableImpulse} interface or a function to write the derived value back to the source.
 * @param options optional {@link ImpulseOptions}.
 * @param options.equals the {@link Equal} function that determines whether or not a new Impulse's value replaces the current one. Defaults to {@link Object.is}.
 *
 * @returns a new {@link Impulse}.
 *
 * @version 1.0.0
 */
function Impulse<TDerivedValue>(
  getter: ReadableImpulse<TDerivedValue> | ((scope: Scope) => TDerivedValue),
  setter: WritableImpulse<TDerivedValue> | ((value: TDerivedValue, scope: Scope) => void),
  options?: ImpulseOptions<TDerivedValue>,
): Impulse<TDerivedValue>

/**
 * Creates a new {@link Impulse}.
 *
 * @template TValue the type of the Impulse value.
 *
 * @param initialValue the initial value.
 * @param options optional {@link ImpulseOptions}.
 * @param options.equals the {@link Equal} function that determines whether or not a new Impulse's value replaces the current one. Defaults to {@link Object.is}.
 *
 * @version 1.0.0
 */
function Impulse<TValue>(initialValue: TValue, options?: ImpulseOptions<TValue>): Impulse<TValue>

function Impulse<T>(
  initialValueOrReadableImpulse?: T | ReadableImpulse<T> | ((scope: Scope) => T),
  optionsOrWritableImpulse?:
    | ImpulseOptions<T>
    | WritableImpulse<T>
    | ((value: T, scope: Scope) => void),
  optionsOrNothing?: ImpulseOptions<T>,
): Impulse<undefined | T> | Impulse<T> {
  const isGetterFunction = isFunction(initialValueOrReadableImpulse)

  if (!(isGetterFunction || hasProperty(initialValueOrReadableImpulse, "read"))) {
    const directOptions = optionsOrWritableImpulse as undefined | ImpulseOptions<undefined | T>

    return new ImpulseImpl(initialValueOrReadableImpulse, directOptions?.equals ?? isStrictEqual)
  }

  const [setter, derivedOptions] =
    isFunction(optionsOrWritableImpulse) || hasProperty(optionsOrWritableImpulse, "update")
      ? [optionsOrWritableImpulse, optionsOrNothing]
      : [undefined, optionsOrWritableImpulse]

  return new DerivedImpulse(
    isGetterFunction
      ? initialValueOrReadableImpulse
      : (scope) => initialValueOrReadableImpulse.read(scope),
    isFunction(setter) ? setter : (value) => setter?.update(value),
    derivedOptions?.equals ?? isStrictEqual,
  )
}

export type { ReadonlyImpulse }
export { Impulse }
