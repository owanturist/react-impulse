import { isFunction } from "~/tools/is-function"
import { isStrictEqual } from "~/tools/is-strict-equal"

import type { Compare } from "./compare"
import type { Impulse } from "./impulse"
import type { ImpulseOptions } from "./impulse-options"
import type { ReadableImpulse } from "./readable-impulse"
import { EMITTER_KEY, STATIC_SCOPE, type Scope, extractScope } from "./scope"
import { type ScopeEmitter, enqueue } from "./scope-emitter"
import type { WritableImpulse } from "./writable-impulse"

export abstract class BaseImpulse<T>
  implements ReadableImpulse<T>, WritableImpulse<T>
{
  protected readonly _emitters = new Set<WeakRef<ScopeEmitter>>()

  protected constructor(protected readonly _compare: Compare<T>) {}

  protected abstract _getter(): T

  protected abstract _setter(value: T): void | true

  protected abstract _clone(value: T, compare: Compare<T>): Impulse<T>

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

    return this.getValue(scope)
  }

  /**
   * Return the stringified value when an Impulse converts to a string.
   *
   * The method is protected in order to make it impossible to make the implicit call.
   * @version 1.0.0
   */
  protected toString(): string {
    const scope = extractScope()

    return String(this.getValue(scope))
  }

  /**
   * Returns the impulse value.
   *
   * @param scope the Scope that tracks the Impulse value changes.
   *
   * @version 1.0.0
   */
  public getValue(scope: Scope): T {
    scope[EMITTER_KEY]?._attachTo(this._emitters)

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
  public setValue(
    valueOrTransform: T | ((currentValue: T, scope: Scope) => T),
  ): void {
    enqueue((queue) => {
      const nextValue = isFunction(valueOrTransform)
        ? valueOrTransform(this._getter(), STATIC_SCOPE)
        : valueOrTransform

      if (this._setter(nextValue)) {
        queue._push(this._emitters)
      }
    })
  }

  /**
   * Creates a new Impulse instance out of the current one with the same value.
   *
   * @param options optional `ImpulseOptions`.
   * @param options.compare when not defined it uses the `compare` function from the origin Impulse, When `null` the `Object.is` function applies to compare the values.
   *
   * @version 2.0.0
   */
  public clone(options?: ImpulseOptions<T>): Impulse<T>

  /**
   * Creates a new Impulse instance out of the current one with the transformed value. Transforming might be handy when cloning mutable values (such as an Impulse).
   *
   * @param transform an optional function that applies to the current value before cloning. It might be handy when cloning mutable values.
   * @param options optional `ImpulseOptions`.
   * @param options.compare when not defined it uses the `compare` function from the origin Impulse, When `null` the `Object.is` function applies to compare the values.
   *
   * @version 1.0.0
   */
  public clone(
    transform: (value: T, scope: Scope) => T,
    options?: ImpulseOptions<T>,
  ): Impulse<T>

  public clone(
    transformOrOptions?: ((value: T, scope: Scope) => T) | ImpulseOptions<T>,
    maybeOptions?: ImpulseOptions<T>,
  ): Impulse<T> {
    const value = this._getter()

    const [clonedValue, { compare = this._compare } = {}] = isFunction(
      transformOrOptions,
    )
      ? [transformOrOptions(value, STATIC_SCOPE), maybeOptions]
      : [value, transformOrOptions]

    return this._clone(clonedValue, compare ?? isStrictEqual)
  }
}
