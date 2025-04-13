import { type Func, type Compare, eq, isFunction, hasProperty } from "./utils"
import { EMITTER_KEY, type Scope, extractScope, STATIC_SCOPE } from "./Scope"
import { ScopeEmitter } from "./ScopeEmitter"

export interface ImpulseOptions<T> {
  /**
   * The compare function determines whether or not a new Impulse's value replaces the current one.
   * In many cases specifying the function leads to better performance because it prevents unnecessary updates.
   */
  readonly compare?: null | Compare<T>
}

export type ReadonlyImpulse<T> = Omit<Impulse<T>, "setValue">

export interface ImpulseGetter<T> {
  getValue(scope: Scope): T
}

export interface ImpulseSetter<T> {
  setValue(value: T): void
}

function isImpulse<T, Unknown = unknown>(
  input: Unknown | Impulse<T>,
): input is Impulse<T> {
  return input instanceof Impulse
}

export abstract class Impulse<T> implements ImpulseGetter<T>, ImpulseSetter<T> {
  /**
   * A static method to check whether or not the input is an Impulse.
   *
   * @version 2.0.0
   */
  public static isImpulse<T, Unknown = unknown>(
    input: Unknown | Impulse<T>,
  ): input is Impulse<T>

  /**
   * A static method to check whether or not the input is an Impulse.
   *
   * @version 2.0.0
   */
  public static isImpulse<T, Unknown = unknown>(
    input: Unknown | ReadonlyImpulse<T>,
  ): input is ReadonlyImpulse<T>

  /**
   * A static method to check whether or not an Impulse value passes the `check`.
   *
   * @version 2.0.0
   */
  public static isImpulse<T, Unknown = unknown>(
    scope: Scope,
    check: (value: unknown) => value is T,
    input: Unknown | Impulse<T>,
  ): input is Impulse<T>

  /**
   * A static method to check whether or not an Impulse value passes the `check`.
   *
   * @version 2.0.0
   */
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

    if (isImpulse(args[2])) {
      const value = args[2].getValue(args[0])

      return args[1](value)
    }

    return false
  }

  /**
   * Creates a new Impulse without an initial value.
   *
   * @version 1.2.0
   *
   * @example
   * const answer = Impulse.of<string>()
   * const initiallyUndefined = answer.getValue(scope) === undefined
   */
  public static of<T = undefined>(): Impulse<undefined | T>

  /**
   * Creates a new derived ReadonlyImpulse.
   * A derived Impulse is an Impulse that does not have its own value but reads it from the external source.
   *
   * @param getter a function to read the derived value from a source.
   * @param options optional `ImpulseOptions`.
   * @param options.compare when not defined or `null` then `Object.is` applies as a fallback.
   *
   * @version 3.0.0
   */
  public static of<T>(
    getter: (scope: Scope) => T,
    options?: ImpulseOptions<T>,
  ): ReadonlyImpulse<T>

  /**
   * Creates a new derived Impulse.
   * A derived Impulse is an Impulse that does not have its own value but reads it from the external source and writes it back.
   *
   * @param getter either anything that implements the `ImpulseGetter` interface or a function to read the derived value from the source.
   * @param setter either anything that implements the `ImpulseSetter` interface or a function to write the derived value back to the source.
   * @param options optional `ImpulseOptions`.
   * @param options.compare when not defined or `null` then `Object.is` applies as a fallback.
   *
   * @version 3.0.0
   */
  public static of<T>(
    getter: ImpulseGetter<T> | ((scope: Scope) => T),
    setter: ImpulseSetter<T> | ((value: T, scope: Scope) => void),
    options?: ImpulseOptions<T>,
  ): Impulse<T>

  /**
   * Creates a new Impulse.
   *
   * @param initialValue the initial value.
   * @param options optional `ImpulseOptions`.
   * @param options.compare when not defined or `null` then `Object.is` applies as a fallback.
   *
   * @version 1.0.0
   */
  public static of<T>(initialValue: T, options?: ImpulseOptions<T>): Impulse<T>

  public static of<T>(
    initialValueOrGetter?: T | ImpulseGetter<T> | Func<[Scope], T>,
    optionsOrSetter?: ImpulseOptions<T> | ImpulseSetter<T> | Func<[T, Scope]>,
    optionsOrNothing?: ImpulseOptions<T>,
  ): Impulse<undefined | T> | Impulse<T> {
    const isGetterFunction = isFunction(initialValueOrGetter)

    if (!isGetterFunction && !hasProperty(initialValueOrGetter, "getValue")) {
      const options = optionsOrSetter as
        | undefined
        | ImpulseOptions<undefined | T>

      return new DirectImpulse(initialValueOrGetter, options?.compare ?? eq)
    }

    const [setter, options] =
      isFunction(optionsOrSetter) || hasProperty(optionsOrSetter, "setValue")
        ? [optionsOrSetter, optionsOrNothing]
        : [undefined, optionsOrSetter]

    return new DerivedImpulse(
      isGetterFunction
        ? initialValueOrGetter
        : (scope) => initialValueOrGetter.getValue(scope),
      isFunction(setter) ? setter : (value) => setter?.setValue(value),
      options?.compare ?? eq,
    )
  }

  protected readonly _emitters = new Set<WeakRef<ScopeEmitter>>()

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

  protected abstract _getter(): T
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
    const value = this._getter()

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
    ScopeEmitter._schedule((queue) => {
      const nextValue = isFunction(valueOrTransform)
        ? valueOrTransform(this._getter(), STATIC_SCOPE)
        : valueOrTransform

      if (this._setter(nextValue)) {
        queue.push(this._emitters)
      }
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
    const hasValueChanged = !this._compare(this._value, value, STATIC_SCOPE)

    if (hasValueChanged) {
      this._value = value
    }

    return hasValueChanged
  }
}
console.log("TODO split Lazy abstraction")
class DerivedImpulse<T> extends Impulse<T> {
  private readonly _scope = {
    [EMITTER_KEY]: ScopeEmitter._init(() => {
      ScopeEmitter._schedule((queue) => {
        const version = this._scope[EMITTER_KEY]._getVersion()

        if (!this._lazy) {
          const value = this._getValue(this._scope)

          this._lazy = { _version: version, _value: value }

          queue.push(this._emitters)
        } else {
          const value = this._getValue(this._scope)

          if (!this._compare(this._lazy._value, value, STATIC_SCOPE)) {
            this._lazy._value = value
            queue.push(this._emitters)
          }

          this._lazy._version = version
        }
      })
    }),
  } satisfies Scope

  private _lazy?: { _version: number; _value: T }

  public constructor(
    private readonly _getValue: Func<[Scope], T>,
    private readonly _setValue: Func<[T, Scope]>,
    compare: Compare<T>,
  ) {
    super(compare)
  }

  protected _getter(): T {
    const version = this._scope[EMITTER_KEY]._getVersion()

    if (this._lazy) {
      return this._lazy._value
    }

    const value = this._getValue(this._scope)

    this._lazy = { _version: version, _value: value }

    return value
  }

  protected _setter(value: T): false {
    this._setValue(value, STATIC_SCOPE)

    // a derived Impulse never queues emit on setValue
    return false
  }
}
