import { Compare, eq, isFunction, noop } from "./utils"
import { EMITTER_KEY, STATIC_SCOPE, Scope, extractScope } from "./Scope"
import { ScopeEmitter } from "./ScopeEmitter"
import { stopInsideContext, warnInsideContext } from "./validation"
import { batch } from "./batch"

export type ReadonlyImpulse<T> = Omit<Impulse<T>, "setValue">

export abstract class Impulse<T> {
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
  @warnInsideContext(
    "subscribe",
    /* c8 ignore next 2 */
    process.env.NODE_ENV === "production"
      ? ""
      : "You should not call Impulse.of inside of the subscribe listener. The listener is for read-only operations but Impulse.of creates a new Impulse.",
  )
  @warnInsideContext(
    "useScoped",
    /* c8 ignore next 2 */
    process.env.NODE_ENV === "production"
      ? ""
      : "You should not call Impulse.of inside of the useScoped factory. The useScoped hook is for read-only operations but Impulse.of creates a new Impulse.",
  )
  @warnInsideContext(
    "useScopedMemo",
    /* c8 ignore next 2 */
    process.env.NODE_ENV === "production"
      ? ""
      : "You should not call Impulse.of inside of the useScopedMemo factory. The useScopedMemo hook is for read-only operations but Impulse.of creates a new Impulse.",
  )
  public static of<T>(
    initialValue?: T,
    compare?: null | Compare<undefined | T>,
  ): Impulse<undefined | T> {
    return new DirectImpulse(initialValue, compare ?? eq)
  }

  public static transmit<T>(getter: (scope: Scope) => T): ReadonlyImpulse<T>
  public static transmit<T>(
    getter: (scope: Scope) => T,
    setter: (value: T, scope: Scope) => void,
  ): Impulse<T>
  public static transmit<T>(
    getter: (scope: Scope) => T,
    setter: (value: T, scope: Scope) => void = noop,
  ): Impulse<T> {
    return new TransmittingImpulse(getter, setter)
  }

  private readonly emitters = new Set<ScopeEmitter>()

  /**
   * The `Compare` function compares Impulse's value with the new value given via `Impulse#setValue`.
   * Whenever the function returns `true`, neither the value change nor it notifies the listeners subscribed via `Impulse#subscribe`.
   *
   * @version 1.0.0
   */
  public readonly compare: Compare<T>

  protected constructor(compare: Compare<T> = eq) {
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
    return this.getValue(extractScope())
  }

  /**
   * Return the stringified value when an Impulse converts to a string.
   *
   * The method is protected in order to make it impossible to make the implicit call.
   * @version 1.0.0
   */
  protected toString(): string {
    return String(this.getValue(extractScope()))
  }

  protected abstract getter(scope: Scope): T

  protected emit(execute: () => boolean): void {
    ScopeEmitter.schedule(() => (execute() ? this.emitters : null))
  }

  /**
   * Clones an Impulse.
   *
   * @param transform an optional function that applies to the current value before cloning. It might be handy when cloning mutable values.
   * @param compare an optional `Compare` function applied as `Impulse#compare`. When not defined, it uses the `Impulse#compare` function from the origin. When `null` the `Object.is` function applies to compare the values.
   *
   * @version 1.0.0
   */
  @warnInsideContext(
    "subscribe",
    /* c8 ignore next 2 */
    process.env.NODE_ENV === "production"
      ? ""
      : "You should not call Impulse#clone inside of the subscribe listener. The listener is for read-only operations but Impulse#clone clones an existing Impulse.",
  )
  @warnInsideContext(
    "useScoped",
    /* c8 ignore next 2 */
    process.env.NODE_ENV === "production"
      ? ""
      : "You should not call Impulse#clone inside of the useScoped factory. The useScoped hook is for read-only operations but Impulse#clone clones an existing Impulse.",
  )
  @warnInsideContext(
    "useScopedMemo",
    /* c8 ignore next 2 */
    process.env.NODE_ENV === "production"
      ? ""
      : "You should not call Impulse#clone inside of the useScopedMemo factory. The useScopedMemo hook is for read-only operations but Impulse#clone clones an existing Impulse.",
  )
  public clone(
    transform?: (value: T, scope: Scope) => T,
    compare: null | Compare<T> = this.compare,
  ): Impulse<T> {
    const value = this.getValue(STATIC_SCOPE)

    return new DirectImpulse(
      isFunction(transform) ? transform(value, STATIC_SCOPE) : value,
      compare ?? eq,
    )
  }

  /**
   * Returns the current value.
   *
   * @version 1.0.0
   */
  public getValue(scope: Scope): T
  /**
   * Returns a value selected from the current value.
   *
   * @param select an optional function that applies to the current value before returning.
   *
   * @version 1.0.0
   */
  public getValue<R>(scope: Scope, select: (value: T, scope: Scope) => R): R
  public getValue<R>(
    scope: Scope,
    select?: (value: T, scope: Scope) => R,
  ): T | R {
    scope[EMITTER_KEY]?.attachTo(this.emitters)

    const value = this.getter(scope)

    return isFunction(select) ? select(value, scope) : value
  }

  /**
   * Updates the value.
   * All listeners registered via the `Impulse#subscribe` method execute whenever the Impulse's value updates.
   *
   * @param valueOrTransform either the new value or a function that transforms the current value.
   * @param compare an optional `Compare` function applied for this call only. When not defined the `Impulse#compare` function will be used. When `null` the `Object.is` function applies to compare the values.
   *
   * @returns `void` to emphasize that Impulses are mutable.
   *
   * @version 1.0.0
   */
  public abstract setValue(
    valueOrTransform: T | ((currentValue: T, scope: Scope) => T),
    compare?: null | Compare<T>,
  ): void
}

export class DirectImpulse<T> extends Impulse<T> {
  public constructor(
    private value: T,
    compare: Compare<T>,
  ) {
    super(compare)
  }

  protected getter(): T {
    return this.value
  }

  @stopInsideContext(
    "scoped",
    /* c8 ignore next 2 */
    process.env.NODE_ENV === "production"
      ? ""
      : "You should not call Impulse#setValue during rendering of scoped(Component)",
  )
  @stopInsideContext(
    "useScoped",
    /* c8 ignore next 2 */
    process.env.NODE_ENV === "production"
      ? ""
      : "You should not call Impulse#setValue inside of the useScoped factory. The useScoped hook is for read-only operations but Impulse#setValue changes an existing Impulse.",
  )
  @stopInsideContext(
    "useScopedMemo",
    /* c8 ignore next 2 */
    process.env.NODE_ENV === "production"
      ? ""
      : "You should not call Impulse#setValue inside of the useScopedMemo factory. The useScopedMemo hook is for read-only operations but Impulse#setValue changes an existing Impulse.",
  )
  public setValue(
    valueOrTransform: T | ((currentValue: T, scope: Scope) => T),
    compare: null | Compare<T> = this.compare,
  ): void {
    const finalCompare = compare ?? eq

    this.emit(() => {
      const nextValue = isFunction(valueOrTransform)
        ? valueOrTransform(this.value, STATIC_SCOPE)
        : valueOrTransform

      if (finalCompare(this.value, nextValue)) {
        return false
      }

      this.value = nextValue

      return true
    })
  }
}

export class TransmittingImpulse<T> extends Impulse<T> {
  public constructor(
    protected _getter: (scope: Scope) => T,
    protected readonly _setter: (value: T, scope: Scope) => void,
  ) {
    super()
  }

  protected getter(scope: Scope): T {
    return this._getter(scope)
  }

  public setValue(
    valueOrTransform: T | ((currentValue: T, scope: Scope) => T),
  ): void {
    batch((scope) => {
      this._setter(
        isFunction(valueOrTransform)
          ? valueOrTransform(this._getter(scope), scope)
          : valueOrTransform,
        STATIC_SCOPE,
      )
    })
  }

  public replaceGetter(getter: (scope: Scope) => T): void {
    if (this._getter === getter) {
      return
    }

    this.emit(() => {
      this.getter = getter

      return true
    })
  }
}
