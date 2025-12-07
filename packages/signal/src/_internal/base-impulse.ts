import { isFunction } from "~/tools/is-function"
import { isStrictEqual } from "~/tools/is-strict-equal"

import type { Equal } from "../equal"
import type { Impulse } from "../impulse"
import type { ImpulseOptions } from "../impulse-options"
import type { ReadableImpulse } from "../readable-impulse"
import type { WritableImpulse } from "../writable-impulse"

import { enqueue } from "./enqueue"
import { type Monitor, UNTRACKED_MONITOR, attachToMonitor, extractMonitor } from "./monitor"
import type { MonitorEmitter } from "./monitor-emitter"

abstract class BaseImpulse<T> implements ReadableImpulse<T>, WritableImpulse<T> {
  protected readonly _emitters = new Set<WeakRef<MonitorEmitter>>()

  protected constructor(protected readonly _equals: Equal<T>) {}

  protected abstract _getter(): T

  protected abstract _setter(value: T): boolean

  protected abstract _clone(value: T, equals: Equal<T>): Impulse<T>

  /**
   * Return the value when serializing to JSON.
   * It does not encode an Impulse for decoding it back due to runtime parts of the class,
   * that cannot be serialized as JSON.
   *
   * The method is protected in order to make it impossible to make the implicit call.
   *
   * @version 1.0.0
   */
  protected toJSON(): unknown {
    const monitor = extractMonitor()

    return this.read(monitor)
  }

  /**
   * Return the stringified value when an Impulse converts to a string.
   *
   * The method is protected in order to make it impossible to make the implicit call.
   * @version 1.0.0
   */
  protected toString(): string {
    const monitor = extractMonitor()

    return String(this.read(monitor))
  }

  /**
   * Reads the impulse value.
   *
   * @param monitor the {@link Monitor} that tracks the Impulse value changes.
   *
   * @returns the impulse value.
   *
   * @version 1.0.0
   */
  public read(monitor: Monitor): T {
    attachToMonitor(monitor, this._emitters)

    return this._getter()
  }

  /**
   * Updates the value.
   *
   * @param valueOrTransform either the new value or a function that transforms the current value.
   *
   * @returns `void` to emphasize that Impulses are mutable.
   *
   * @version 1.0.0
   */
  public update(valueOrTransform: T | ((currentValue: T, monitor: Monitor) => T)): void {
    enqueue((push) => {
      const nextValue = isFunction(valueOrTransform)
        ? valueOrTransform(this._getter(), UNTRACKED_MONITOR)
        : valueOrTransform

      if (this._setter(nextValue)) {
        push(this._emitters)
      }
    })
  }

  /**
   * Creates a new {@link Impulse} instance out of the current one with the same value.
   *
   * @param options optional {@link ImpulseOptions}.
   * @param options.equal when not defined it uses the {@link ImpulseOptions.equals} function from the origin Impulse, When `null` fallbacks to {@link Object.is}.
   *
   * @returns a new {@link Impulse} instance with the same value.
   *
   * @version 1.0.0
   */
  public clone(options?: ImpulseOptions<T>): Impulse<T>

  /**
   * Creates a new {@link Impulse} instance out of the current one with the transformed value. Transforming might be handy when cloning mutable values (such as an Impulse).
   *
   * @param transform an optional function that applies to the current value before cloning. It might be handy when cloning mutable values.
   * @param options optional {@link ImpulseOptions}.
   * @param options.equal when not defined it uses the {@link ImpulseOptions.equals} function from the origin Impulse, When `null` fallbacks to {@link Object.is}.
   *
   * @return a new {@link Impulse} instance with the transformed value.
   *
   * @version 1.0.0
   */
  public clone(
    transform: (value: T, monitor: Monitor) => T,
    options?: ImpulseOptions<T>,
  ): Impulse<T>

  public clone(
    transformOrOptions?: ((value: T, monitor: Monitor) => T) | ImpulseOptions<T>,
    maybeOptions?: ImpulseOptions<T>,
  ): Impulse<T> {
    const value = this._getter()

    const [clonedValue, { equals = this._equals } = {}] = isFunction(transformOrOptions)
      ? [transformOrOptions(value, UNTRACKED_MONITOR), maybeOptions]
      : [value, transformOrOptions]

    return this._clone(clonedValue, equals ?? isStrictEqual)
  }
}

export { BaseImpulse }
