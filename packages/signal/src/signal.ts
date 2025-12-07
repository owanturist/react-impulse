import { hasProperty } from "~/tools/has-property"
import { isFunction } from "~/tools/is-function"
import { isStrictEqual } from "~/tools/is-strict-equal"

import type { Equal } from "./equal"
import type { ReadableSignal } from "./readable-signal"
import type { SignalOptions } from "./signal-options"
import type { WritableSignal } from "./writable-signal"
import type { BaseSignal } from "./_internal/base-signal"
import { DerivedSignal } from "./_internal/derived-signal"
import type { Monitor } from "./_internal/monitor"
import { Signal as SignalImpl } from "./_internal/signal"

type Signal<T> = BaseSignal<T>

type ReadonlySignal<T> = Omit<Signal<T>, "update">

/**
 * Creates a new {@link Signal} without an initial value.
 *
 * @template TValue the type of the {@link Signal} value.
 *
 * @version 1.0.0
 *
 * @example
 * const signal = Signal<string>()
 * const initiallyUndefined = signal.read(monitor) === undefined
 */
function Signal<TValue = undefined>(): Signal<undefined | TValue>

/**
 * Creates a new Derived {@link ReadonlySignal}.
 * A Derived {@link Signal} is a Signal that keeps the derived value in memory and updates it whenever the source value changes.
 *
 * @template TDerivedValue the type of the derived {@link Signal} value.
 *
 * @param getter either anything that implements the {@link ReadableSignal} interface or a function to read the derived value from the source.
 * @param options optional {@link SignalOptions}.
 * @param options.equals the {@link Equal} function that determines whether or not a new {@link Signal}'s value replaces the current one. Defaults to {@link Object.is}.
 *
 * @returns a new {@link ReadonlySignal}.
 *
 * @version 1.0.0
 */
function Signal<TDerivedValue>(
  getter: ReadableSignal<TDerivedValue> | ((monitor: Monitor) => TDerivedValue),
  options?: SignalOptions<TDerivedValue>,
): ReadonlySignal<TDerivedValue>

/**
 * Creates a new derived {@link Signal}.
 * A Derived {@link Signal} is a Signal that keeps the derived value in memory and updates it whenever the source value changes.
 *
 * @template TDerivedValue the type of the derived {@link Signal} value.
 *
 * @param getter either anything that implements the {@link ReadableSignal} interface or a function to read the derived value from the source.
 * @param setter either anything that implements the {@link WritableSignal} interface or a function to write the derived value back to the source.
 * @param options optional {@link SignalOptions}.
 * @param options.equals the {@link Equal} function that determines whether or not a new {@link Signal}'s value replaces the current one. Defaults to {@link Object.is}.
 *
 * @returns a new {@link Signal}.
 *
 * @version 1.0.0
 */
function Signal<TDerivedValue>(
  getter: ReadableSignal<TDerivedValue> | ((monitor: Monitor) => TDerivedValue),
  setter: WritableSignal<TDerivedValue> | ((value: TDerivedValue, monitor: Monitor) => void),
  options?: SignalOptions<TDerivedValue>,
): Signal<TDerivedValue>

/**
 * Creates a new {@link Signal}.
 *
 * @template TValue the type of the {@link Signal} value.
 *
 * @param initialValue the initial value.
 * @param options optional {@link SignalOptions}.
 * @param options.equals the {@link Equal} function that determines whether or not a new {@link Signal}'s value replaces the current one. Defaults to {@link Object.is}.
 *
 * @version 1.0.0
 */
function Signal<TValue>(initialValue: TValue, options?: SignalOptions<TValue>): Signal<TValue>

function Signal<T>(
  initialValueOrReadableSignal?: T | ReadableSignal<T> | ((monitor: Monitor) => T),
  optionsOrWritableSignal?:
    | SignalOptions<T>
    | WritableSignal<T>
    | ((value: T, monitor: Monitor) => void),
  optionsOrNothing?: SignalOptions<T>,
): Signal<undefined | T> | Signal<T> {
  const isGetterFunction = isFunction(initialValueOrReadableSignal)

  if (!(isGetterFunction || hasProperty(initialValueOrReadableSignal, "read"))) {
    const directOptions = optionsOrWritableSignal as undefined | SignalOptions<undefined | T>

    return new SignalImpl(initialValueOrReadableSignal, directOptions?.equals ?? isStrictEqual)
  }

  const [setter, derivedOptions] =
    isFunction(optionsOrWritableSignal) || hasProperty(optionsOrWritableSignal, "update")
      ? [optionsOrWritableSignal, optionsOrNothing]
      : [undefined, optionsOrWritableSignal]

  return new DerivedSignal(
    isGetterFunction
      ? initialValueOrReadableSignal
      : (monitor) => initialValueOrReadableSignal.read(monitor),
    isFunction(setter) ? setter : (value) => setter?.update(value),
    derivedOptions?.equals ?? isStrictEqual,
  )
}

export type { ReadonlySignal }
export { Signal }
