import { isFunction } from "~/tools/is-function"
import { isStrictEqual } from "~/tools/is-strict-equal"

import type { Equal } from "../equal"
import type { ReadableSignal } from "../readable-signal"
import type { Signal } from "../signal"
import type { SignalOptions } from "../signal-options"
import type { WritableSignal } from "../writable-signal"

import { enqueue } from "./enqueue"
import { type Monitor, UNTRACKED_MONITOR, attachToMonitor, extractMonitor } from "./monitor"
import type { MonitorEmitter } from "./monitor-emitter"

abstract class BaseSignal<T> implements ReadableSignal<T>, WritableSignal<T> {
  protected readonly _emitters = new Set<WeakRef<MonitorEmitter>>()

  protected constructor(protected readonly _equals: Equal<T>) {}

  protected abstract _getter(): T

  protected abstract _setter(value: T): boolean

  protected abstract _clone(value: T, equals: Equal<T>): Signal<T>

  /**
   * Return the value when serializing to JSON.
   * It does not encode the instance for decoding it back due to runtime parts of the class,
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
   * Return the stringified value when the instance converts to a string.
   *
   * The method is protected in order to make it impossible to make the implicit call.
   * @version 1.0.0
   */
  protected toString(): string {
    const monitor = extractMonitor()

    return String(this.read(monitor))
  }

  /**
   * Reads the instance's value.
   *
   * @param monitor the {@link Monitor} that tracks the instance value changes.
   *
   * @returns the instance value.
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
   * @returns `void` to emphasize that {@link Signal}s are mutable.
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
   * Creates a new {@link Signal} instance out of the current one with the same value.
   *
   * @param options optional {@link SignalOptions}.
   * @param options.equal when not defined it uses the {@link SignalOptions.equals} function from the origin instance, When `null` fallbacks to {@link Object.is}.
   *
   * @returns a new {@link Signal} instance with the same value.
   *
   * @version 1.0.0
   */
  public clone(options?: SignalOptions<T>): Signal<T>

  /**
   * Creates a new {@link Signal} instance out of the current one with the transformed value. Transforming might be handy when cloning mutable values (such as a {@link Signal}).
   *
   * @param transform an optional function that applies to the current value before cloning. It might be handy when cloning mutable values.
   * @param options optional {@link SignalOptions}.
   * @param options.equal when not defined it uses the {@link SignalOptions.equals} function from the origin instance, When `null` fallbacks to {@link Object.is}.
   *
   * @return a new {@link Signal} instance with the transformed value.
   *
   * @version 1.0.0
   */
  public clone(transform: (value: T, monitor: Monitor) => T, options?: SignalOptions<T>): Signal<T>

  public clone(
    transformOrOptions?: ((value: T, monitor: Monitor) => T) | SignalOptions<T>,
    maybeOptions?: SignalOptions<T>,
  ): Signal<T> {
    const value = this._getter()

    const [clonedValue, { equals = this._equals } = {}] = isFunction(transformOrOptions)
      ? [transformOrOptions(value, UNTRACKED_MONITOR), maybeOptions]
      : [value, transformOrOptions]

    return this._clone(clonedValue, equals ?? isStrictEqual)
  }
}

export { BaseSignal }
