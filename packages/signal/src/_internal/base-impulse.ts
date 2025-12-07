import { isFunction } from "~/tools/is-function"
import { isStrictEqual } from "~/tools/is-strict-equal"

import type { Equal } from "../equal"
import type { Impulse } from "../impulse"
import type { ImpulseOptions } from "../impulse-options"
import type { ReadableImpulse } from "../readable-impulse"
import type { WritableImpulse } from "../writable-impulse"

import { enqueue } from "./enqueue"
import { STATIC_SCOPE, type Scope, attachToScope, extractScope } from "./scope"
import type { ScopeEmitter } from "./scope-emitter"

abstract class BaseImpulse<T> implements ReadableImpulse<T>, WritableImpulse<T> {
  protected readonly _emitters = new Set<WeakRef<ScopeEmitter>>()

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
    const scope = extractScope()

    return this.read(scope)
  }

  /**
   * Return the stringified value when an Impulse converts to a string.
   *
   * The method is protected in order to make it impossible to make the implicit call.
   * @version 1.0.0
   */
  protected toString(): string {
    const scope = extractScope()

    return String(this.read(scope))
  }

  /**
   * Reads the impulse value.
   *
   * @param scope the Scope that tracks the Impulse value changes.
   *
   * @returns the impulse value.
   *
   * @version 1.0.0
   */
  public read(scope: Scope): T {
    attachToScope(scope, this._emitters)

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
  public update(valueOrTransform: T | ((currentValue: T, scope: Scope) => T)): void {
    enqueue((push) => {
      const nextValue = isFunction(valueOrTransform)
        ? valueOrTransform(this._getter(), STATIC_SCOPE)
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
  public clone(transform: (value: T, scope: Scope) => T, options?: ImpulseOptions<T>): Impulse<T>

  public clone(
    transformOrOptions?: ((value: T, scope: Scope) => T) | ImpulseOptions<T>,
    maybeOptions?: ImpulseOptions<T>,
  ): Impulse<T> {
    const value = this._getter()

    const [clonedValue, { equals = this._equals } = {}] = isFunction(transformOrOptions)
      ? [transformOrOptions(value, STATIC_SCOPE), maybeOptions]
      : [value, transformOrOptions]

    return this._clone(clonedValue, equals ?? isStrictEqual)
  }
}

export { BaseImpulse }
