export {
  type ImpulseOptions,
  type ReadonlyImpulse,
  Impulse,
  TransmittingImpulse,
}

import { type Func, type Compare, eq, isFunction } from "./utils"
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

type ReadonlyImpulse<T> = Omit<Impulse<T>, "setValue">

abstract class Impulse<T> {
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
    { compare }: ImpulseOptions<undefined | T> = {},
  ): Impulse<undefined | T> {
    return new DirectImpulse(initialValue, compare ?? eq)
  }

  private readonly _emitters = new Set<ScopeEmitter>()

  protected constructor(protected readonly _compare: Compare<T>) {}

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

  protected _emit(execute: () => boolean): void {
    ScopeEmitter._schedule(() => {
      return execute() ? this._emitters : null
    })
  }

  protected abstract _getter(): T
  protected abstract _setter(valueOrTransform: T | Func<[T], T>): boolean

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
      | [transform: Func<[T], T>, options?: ImpulseOptions<T>]
  ): Impulse<T> {
    const [value, { compare = this._compare } = {}] = isFunction(args[0])
      ? [args[0](this._getter()), args[1]]
      : [this._getter(), args[0]]

    return new DirectImpulse(value, compare ?? eq)
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

  public getValue<R>(select?: Func<[T], R>): T | R {
    const scope = extractScope()

    scope[EMITTER_KEY]?._attachTo(this._emitters)

    const value = this._getter()

    return isFunction(select) ? select(value) : value
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
    this._emit(() => this._setter(valueOrTransform))
  }
}

class DirectImpulse<T> extends Impulse<T> {
  public constructor(
    private _value: T,
    compare: Compare<T>,
  ) {
    super(compare)
  }

  protected _getter(): T {
    return this._value
  }

  protected _setter(valueOrTransform: T | Func<[T], T>): boolean {
    const nextValue = isFunction(valueOrTransform)
      ? valueOrTransform(this._value)
      : valueOrTransform

    if (this._compare(this._value, nextValue)) {
      return false
    }

    this._value = nextValue

    return true
  }
}

class TransmittingImpulse<T> extends Impulse<T> {
  private _value?: { _lazy: T }

  public constructor(
    private _getValue: () => T,
    private readonly _setValue: (value: T) => void,
    compare: Compare<T>,
  ) {
    super(compare)
  }

  protected _getter(): T {
    const value = this._getValue()

    if (this._value == null || !this._compare(this._value._lazy, value)) {
      this._value = { _lazy: value }
    }

    return this._value._lazy
  }

  protected _setter(valueOrTransform: T | Func<[T], T>): boolean {
    const nextValue = isFunction(valueOrTransform)
      ? valueOrTransform(this._getter())
      : valueOrTransform

    this._setValue(nextValue)

    return false
  }

  public _replaceGetter(getter: () => T): void {
    if (this._getValue !== getter) {
      this._emit(() => {
        const value = this._value

        this._getValue = getter

        return value == null || !this._compare(value._lazy, this._getter())
      })
    }
  }
}
