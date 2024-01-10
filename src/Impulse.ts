import { type Func, type Compare, eq, noop, isFunction } from "./utils"
import { EMITTER_KEY, type Scope, extractScope, STATIC_SCOPE } from "./Scope"
import { ScopeEmitter } from "./ScopeEmitter"

export interface ImpulseOptions<T> {
  /**
   * The compare function determines whether or not a new Impulse's value replaces the current one.
   * In many cases specifying the function leads to better performance because it prevents unnecessary updates.
   */
  readonly compare?: null | Compare<T>
}

export interface TransmittingImpulseOptions<T> {
  /**
   * The compare function determines whether or not a transmitting value changes when reading it from an external source.
   */
  readonly compare?: null | Compare<T>
}

export type ReadonlyImpulse<T> = Omit<Impulse<T>, "setValue">

export const isImpulse = <T, Unknown = unknown>(
  input: Unknown | Impulse<T>,
): input is Impulse<T> => {
  return input instanceof Impulse
}

export abstract class Impulse<T> {
  /**
   * TODO add docs
   */
  public static isImpulse<T, Unknown = unknown>(
    input: Unknown | Impulse<T>,
  ): input is Impulse<T>

  public static isImpulse<T, Unknown = unknown>(
    input: Unknown | ReadonlyImpulse<T>,
  ): input is ReadonlyImpulse<T>

  public static isImpulse<T, Unknown = unknown>(
    scope: Scope,
    check: (value: unknown) => value is T,
    input: Unknown | Impulse<T>,
  ): input is Impulse<T>

  public static isImpulse<T, Unknown = unknown>(
    scope: Scope,
    check: (value: unknown) => value is T,
    input: Unknown | ReadonlyImpulse<T>,
  ): input is ReadonlyImpulse<T>

  public static isImpulse(
    ...args:
      | [input: unknown]
      | [scope: Scope, check: Func<[unknown], boolean>, input: unknown]
  ): boolean {
    if (args.length === 1) {
      return isImpulse(args[0])
    }

    return isImpulse(args[2]) && args[2].getValue(args[0], args[1])
  }

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

  public static of<T>(
    initialValue?: T,
    options?: ImpulseOptions<undefined | T>,
  ): Impulse<undefined | T> {
    return new DirectImpulse(initialValue, options?.compare ?? eq)
  }

  /**
   * Creates a new transmitting ReadonlyImpulse.
   * A transmitting Impulse is an Impulse that does not have its own value but reads it from the external source.
   *
   * @param getter a function to read the transmitting value from a source.
   * @param options optional `TransmittingImpulseOptions`.
   * @param options.compare when not defined or `null` then `Object.is` applies as a fallback.
   *
   * @version 2.0.0
   */
  public static transmit<T>(
    getter: (scope: Scope) => T,
    options?: TransmittingImpulseOptions<T>,
  ): ReadonlyImpulse<T>

  /**
   * Creates a new transmitting Impulse.
   * A transmitting Impulse is an Impulse that does not have its own value but reads it from the external source and writes it back.
   *
   * @param getter either a source impulse or a function to read the transmitting value from the source.
   * @param setter either a destination impulse or a function to write the transmitting value back to the source.
   * @param options optional `TransmittingImpulseOptions`.
   * @param options.compare when not defined or `null` then `Object.is` applies as a fallback.
   *
   * @version 2.0.0
   */
  public static transmit<T>(
    getter: ReadonlyImpulse<T> | ((scope: Scope) => T),
    setter: Impulse<T> | ((value: T, scope: Scope) => void),
    options?: TransmittingImpulseOptions<T>,
  ): Impulse<T>

  public static transmit<T>(
    getter: ReadonlyImpulse<T> | Func<[Scope], T>,
    setterOrOptions?:
      | Impulse<T>
      | Func<[T, Scope]>
      | TransmittingImpulseOptions<T>,
    maybeOptions?: TransmittingImpulseOptions<T>,
  ): Impulse<T> {
    const [setter, options] =
      isFunction(setterOrOptions) || isImpulse(setterOrOptions)
        ? [setterOrOptions, maybeOptions]
        : [noop, setterOrOptions]

    return new TransmittingImpulse(
      isFunction(getter) ? getter : (scope) => getter.getValue(scope),
      isFunction(setter) ? setter : (value) => setter.setValue(value),
      options?.compare ?? eq,
    )
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

  protected _emit(execute: () => boolean): void {
    ScopeEmitter._schedule((queue) => {
      if (execute()) {
        queue.push(this._emitters)
      }
    })
  }

  protected abstract _getter(scope: Scope): T
  protected abstract _setter(value: T): boolean

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
    transformOrOptions?: Func<[T, Scope], T> | ImpulseOptions<T>,
    maybeOptions?: ImpulseOptions<T>,
  ): Impulse<T> {
    const value = this._getter(STATIC_SCOPE)

    const [clonedValue, { compare = this._compare } = {}] = isFunction(
      transformOrOptions,
    )
      ? [transformOrOptions(value, STATIC_SCOPE), maybeOptions]
      : [value, transformOrOptions]

    return new DirectImpulse(clonedValue, compare ?? eq)
  }

  /**
   * Returns the impulse value.
   *
   * @param scope the Scope that tracks the Impulse value changes.
   *
   * @version 1.0.0
   */
  public getValue(scope: Scope): T
  /**
   * Returns a value selected from the impulse value.
   *
   * @param scope the Scope that tracks the Impulse value changes.
   * @param select an optional function that applies to the impulse value before returning.
   *
   * @version 1.0.0
   */
  public getValue<R>(scope: Scope, select: (value: T, scope: Scope) => R): R

  public getValue<R>(scope: Scope, select?: Func<[T, Scope], R>): T | R {
    scope[EMITTER_KEY]?._attachTo(this._emitters)

    const value = this._getter(scope)

    return isFunction(select) ? select(value, scope) : value
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
    this._emit(() => {
      const nextValue = isFunction(valueOrTransform)
        ? valueOrTransform(this._getter(STATIC_SCOPE), STATIC_SCOPE)
        : valueOrTransform

      return this._setter(nextValue)
    })
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

  protected _setter(value: T): boolean {
    const isDifferent = !this._compare(this._value, value)

    if (isDifferent) {
      this._value = value
    }

    return isDifferent
  }
}

export class TransmittingImpulse<T> extends Impulse<T> {
  private _value?: { _lazy: T }

  public constructor(
    private _getValue: Func<[Scope], T>,
    private readonly _setValue: Func<[T, Scope]>,
    compare: Compare<T>,
  ) {
    super(compare)
  }

  protected _getter(scope: Scope): T {
    const value = this._getValue(scope)

    if (this._value == null || !this._compare(this._value._lazy, value)) {
      this._value = { _lazy: value }
    }

    return this._value._lazy
  }

  protected _setter(value: T): boolean {
    this._setValue(value, STATIC_SCOPE)

    // the TransmittingImpulse does not need to emit changes by itself
    // the transmitted impulses do it instead
    return false
  }

  public _replaceGetter(getter: (scope: Scope) => T): void {
    if (this._getValue !== getter) {
      this._emit(() => {
        const value = this._value

        this._getValue = getter

        return value != null && value._lazy !== this._getter(STATIC_SCOPE)
      })
    }
  }
}
