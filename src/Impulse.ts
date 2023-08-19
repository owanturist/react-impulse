export { type ImpulseOptions, Impulse }

import { type Compare, eq, isFunction } from "./utils"
import { EMITTER_KEY, extractScope } from "./Scope"
import { ScopeEmitter } from "./ScopeEmitter"
import { validate } from "./validation"
import {
  WATCH_CALLING_IMPULSE_SET_VALUE,
  SUBSCRIBE_CALLING_IMPULSE_OF,
  SUBSCRIBE_CALLING_IMPULSE_CLONE,
  USE_WATCH_IMPULSE_CALLING_IMPULSE_OF,
  USE_WATCH_IMPULSE_CALLING_IMPULSE_CLONE,
  USE_WATCH_IMPULSE_CALLING_IMPULSE_SET_VALUE,
  USE_IMPULSE_MEMO_CALLING_IMPULSE_OF,
  USE_IMPULSE_MEMO_CALLING_IMPULSE_CLONE,
  USE_IMPULSE_MEMO_CALLING_IMPULSE_SET_VALUE,
} from "./messages"

interface ImpulseOptions<T> {
  /**
   * The compare function determines whether or not a new Impulse's value replaces the current one.
   * In many cases specifying the function leads to better performance because it prevents unnecessary updates.
   */
  compare?: null | Compare<T>
}

class Impulse<T> {
  /**
   * Creates new Impulse without an initial value.
   *
   * @version 1.2.0
   */
  public static of<T = undefined>(): Impulse<undefined | T>

  /**
   * Creates new Impulse.
   *
   * @param initialValue the initial value.
   * @param options optional `ImpulseOptions`.
   * @param options.compare when not defined or `null` then `Object.is` applies as a fallback.
   *
   * @version 1.0.0
   */
  public static of<T>(initialValue: T, options?: ImpulseOptions<T>): Impulse<T>

  @validate
    ._when("subscribe", SUBSCRIBE_CALLING_IMPULSE_OF)
    ._when("useWatchImpulse", USE_WATCH_IMPULSE_CALLING_IMPULSE_OF)
    ._when("useImpulseMemo", USE_IMPULSE_MEMO_CALLING_IMPULSE_OF)
    ._alert()
  public static of<T>(
    initialValue?: T,
    options?: ImpulseOptions<undefined | T>,
  ): Impulse<undefined | T> {
    return new Impulse(initialValue, options)
  }

  private readonly _emitters = new Set<ScopeEmitter>()
  private readonly _compare: Compare<T>

  private constructor(
    private _value: T,
    options: undefined | ImpulseOptions<T>,
  ) {
    this._compare = options?.compare ?? eq
  }

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
    return this.getValue()
  }

  /**
   * Return the stringified value when an Impulse converts to a string.
   *
   * The method is protected in order to make it impossible to make the implicit call.
   * @version 1.0.0
   */
  protected toString(): string {
    return String(this.getValue())
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
    transform: (value: T) => T,
    options?: ImpulseOptions<T>,
  ): Impulse<T>

  @validate
    ._when("subscribe", SUBSCRIBE_CALLING_IMPULSE_CLONE)
    ._when("useWatchImpulse", USE_WATCH_IMPULSE_CALLING_IMPULSE_CLONE)
    ._when("useImpulseMemo", USE_IMPULSE_MEMO_CALLING_IMPULSE_CLONE)
    ._alert()
  public clone(
    ...args:
      | [options?: ImpulseOptions<T>]
      | [transform: (value: T) => T, options?: ImpulseOptions<T>]
  ): Impulse<T> {
    const [value, { compare = this._compare } = {}] = isFunction(args[0])
      ? [args[0](this._value), args[1]]
      : [this._value, args[0]]

    return new Impulse(value, { compare })
  }

  /**
   * Returns the current value.
   *
   * @version 1.0.0
   */
  public getValue(): T
  /**
   * Returns a value selected from the current value.
   *
   * @param select an optional function that applies to the current value before returning.
   *
   * @version 1.0.0
   */
  public getValue<R>(select: (value: T) => R): R

  public getValue<R>(select?: (value: T) => R): T | R {
    const scope = extractScope()

    scope[EMITTER_KEY]?._attachTo(this._emitters)

    return isFunction(select) ? select(this._value) : this._value
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
  @validate
    ._when("watch", WATCH_CALLING_IMPULSE_SET_VALUE)
    ._when("useWatchImpulse", USE_WATCH_IMPULSE_CALLING_IMPULSE_SET_VALUE)
    ._when("useImpulseMemo", USE_IMPULSE_MEMO_CALLING_IMPULSE_SET_VALUE)
    ._prevent()
  public setValue(valueOrTransform: T | ((currentValue: T) => T)): void {
    ScopeEmitter._schedule(() => {
      const nextValue = isFunction(valueOrTransform)
        ? valueOrTransform(this._value)
        : valueOrTransform

      if (this._compare(this._value, nextValue)) {
        return null
      }

      this._value = nextValue

      return this._emitters
    })
  }
}
