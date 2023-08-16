export { Impulse }

import { type Compare, eq, isFunction, noop } from "./utils"
import { EMITTER_KEY, extractScope } from "./Scope"
import { ScopeEmitter } from "./ScopeEmitter"
import { validate } from "./validation"
import {
  WATCH_CALLING_IMPULSE_SET_VALUE,
  WATCH_CALLING_IMPULSE_SUBSCRIBE,
  SUBSCRIBE_CALLING_IMPULSE_OF,
  SUBSCRIBE_CALLING_IMPULSE_CLONE,
  SUBSCRIBE_CALLING_IMPULSE_SUBSCRIBE,
  USE_WATCH_IMPULSE_CALLING_IMPULSE_OF,
  USE_WATCH_IMPULSE_CALLING_IMPULSE_CLONE,
  USE_WATCH_IMPULSE_CALLING_IMPULSE_SET_VALUE,
  USE_WATCH_IMPULSE_CALLING_IMPULSE_SUBSCRIBE,
  USE_IMPULSE_MEMO_CALLING_IMPULSE_OF,
  USE_IMPULSE_MEMO_CALLING_IMPULSE_CLONE,
  USE_IMPULSE_MEMO_CALLING_IMPULSE_SET_VALUE,
  USE_IMPULSE_MEMO_CALLING_IMPULSE_SUBSCRIBE,
} from "./messages"

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
   * @param compare an optional `Compare` function applied as `Impulse#compare`. When not defined or `null` then `Object.is` applies as a fallback.
   *
   * @version 1.0.0
   */
  public static of<T>(initialValue: T, compare?: null | Compare<T>): Impulse<T>

  // Implements 👆
  @validate
    ._when("subscribe", SUBSCRIBE_CALLING_IMPULSE_OF)
    ._when("useWatchImpulse", USE_WATCH_IMPULSE_CALLING_IMPULSE_OF)
    ._when("useImpulseMemo", USE_IMPULSE_MEMO_CALLING_IMPULSE_OF)
    ._alert()

  /**
   * Creates new Impulse.
   *
   * @param initialValue an optional initial value.
   * @param compare an optional `Compare` function applied as `Impulse#compare`. When not defined or `null` then `Object.is` applies as a fallback.
   *
   * @version 1.0.0
   */
  public static of<T>(
    initialValue?: T,
    compare?: null | Compare<undefined | T>,
  ): Impulse<undefined | T> {
    return new Impulse(initialValue, compare ?? eq)
  }

  private readonly _emitters = new Set<ScopeEmitter>()

  /**
   * The `Compare` function compares Impulse's value with the new value given via `Impulse#setValue`.
   * Whenever the function returns `true`, neither the value change nor it notifies the listeners subscribed via `Impulse#subscribe`.
   *
   * @version 1.0.0
   */
  public readonly compare: Compare<T>

  private constructor(
    private _value: T,
    compare: Compare<T>,
  ) {
    this.compare = compare
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

  @validate
    ._when("subscribe", SUBSCRIBE_CALLING_IMPULSE_CLONE)
    ._when("useWatchImpulse", USE_WATCH_IMPULSE_CALLING_IMPULSE_CLONE)
    ._when("useImpulseMemo", USE_IMPULSE_MEMO_CALLING_IMPULSE_CLONE)
    ._alert()
  /**
   * Clones an Impulse.
   *
   * @param transform an optional function that applies to the current value before cloning. It might be handy when cloning mutable values.
   * @param compare an optional `Compare` function applied as `Impulse#compare`. When not defined, it uses the `Impulse#compare` function from the origin. When `null` the `Object.is` function applies to compare the values.
   *
   * @version 1.0.0
   */
  public clone(
    transform?: (value: T) => T,
    compare: null | Compare<T> = this.compare,
  ): Impulse<T> {
    return new Impulse(
      isFunction(transform) ? transform(this._value) : this._value,
      compare ?? eq,
    )
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

  /**
   * Returns a value selected from the current value.
   *
   * @param select an optional function that applies to the current value before returning.
   *
   * @version 1.0.0
   */
  public getValue<R>(select?: (value: T) => R): T | R {
    const scope = extractScope()

    scope[EMITTER_KEY]?._attachTo(this._emitters)

    return isFunction(select) ? select(this._value) : this._value
  }

  @validate
    ._when("watch", WATCH_CALLING_IMPULSE_SET_VALUE)
    ._when("useWatchImpulse", USE_WATCH_IMPULSE_CALLING_IMPULSE_SET_VALUE)
    ._when("useImpulseMemo", USE_IMPULSE_MEMO_CALLING_IMPULSE_SET_VALUE)
    ._prevent()
  /**
   * Updates the value.
   * All listeners registered via the `Impulse#subscribe` method execute whenever the Impulse's value updates.
   *
   * @param valueOrTransform either the new value or a function that transforms the current value.
   *
   * @returns `void` to emphasize that Impulses are mutable.
   *
   * @version 1.0.0
   */
  public setValue(valueOrTransform: T | ((currentValue: T) => T)): void {
    ScopeEmitter._schedule(() => {
      const nextValue = isFunction(valueOrTransform)
        ? valueOrTransform(this._value)
        : valueOrTransform

      if (this.compare(this._value, nextValue)) {
        return null
      }

      this._value = nextValue

      return this._emitters
    })
  }

  @validate
    ._when("watch", WATCH_CALLING_IMPULSE_SUBSCRIBE)
    ._when("subscribe", SUBSCRIBE_CALLING_IMPULSE_SUBSCRIBE)
    ._when("useWatchImpulse", USE_WATCH_IMPULSE_CALLING_IMPULSE_SUBSCRIBE)
    ._when("useImpulseMemo", USE_IMPULSE_MEMO_CALLING_IMPULSE_SUBSCRIBE)
    ._prevent(noop)
  /**
   * Subscribes to the value's updates caused by calling `Impulse#setValue`.
   *
   * @param listener a function that subscribes to the updates.
   *
   * @returns a cleanup function that unsubscribes the `listener`.
   *
   * @version 1.0.0
   *
   * @deprecated The method is deprecated in favor of the `subscribe` higher-order function. It will be removed in the next major release.
   */
  public subscribe(listener: VoidFunction): VoidFunction {
    const emitter = new ScopeEmitter(false)

    emitter._attachTo(this._emitters)

    return emitter._onEmit(listener)
  }
}
