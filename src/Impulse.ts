import { Compare, eq, isFunction } from "./utils"
import { EMITTER_KEY, extractScope } from "./Scope"
import { ScopeEmitter } from "./ScopeEmitter"
import { stopInsideContext, warnInsideContext } from "./validation"

export class Impulse<T> {
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
    "useWatchImpulse",
    /* c8 ignore next 2 */
    process.env.NODE_ENV === "production"
      ? ""
      : "You should not call Impulse.of inside of the useWatchImpulse factory. The useWatchImpulse hook is for read-only operations but Impulse.of creates a new Impulse.",
  )
  @warnInsideContext(
    "useImpulseMemo",
    /* c8 ignore next 2 */
    process.env.NODE_ENV === "production"
      ? ""
      : "You should not call Impulse.of inside of the useImpulseMemo factory. The useImpulseMemo hook is for read-only operations but Impulse.of creates a new Impulse.",
  )
  public static of<T>(
    initialValue?: T,
    compare?: null | Compare<undefined | T>,
  ): Impulse<undefined | T> {
    return new Impulse(initialValue, compare ?? eq)
  }

  private readonly emitters = new Set<ScopeEmitter>()

  /**
   * The `Compare` function compares Impulse's value with the new value given via `Impulse#setValue`.
   * Whenever the function returns `true`, neither the value change nor it notifies the listeners subscribed via `Impulse#subscribe`.
   *
   * @version 1.0.0
   */
  public readonly compare: Compare<T>

  private constructor(private value: T, compare: Compare<T>) {
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

  // TODO remove this method
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
    "useWatchImpulse",
    /* c8 ignore next 2 */
    process.env.NODE_ENV === "production"
      ? ""
      : "You should not call Impulse#clone inside of the useWatchImpulse factory. The useWatchImpulse hook is for read-only operations but Impulse#clone clones an existing Impulse.",
  )
  @warnInsideContext(
    "useImpulseMemo",
    /* c8 ignore next 2 */
    process.env.NODE_ENV === "production"
      ? ""
      : "You should not call Impulse#clone inside of the useImpulseMemo factory. The useImpulseMemo hook is for read-only operations but Impulse#clone clones an existing Impulse.",
  )
  public clone(
    transform?: (value: T) => T,
    compare: null | Compare<T> = this.compare,
  ): Impulse<T> {
    return new Impulse(
      isFunction(transform) ? transform(this.value) : this.value,
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
  public getValue<R>(select?: (value: T) => R): T | R {
    const scope = extractScope()

    scope[EMITTER_KEY]?.attachTo(this.emitters)

    return isFunction(select) ? select(this.value) : this.value
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
  @stopInsideContext(
    "watch",
    /* c8 ignore next 2 */
    process.env.NODE_ENV === "production"
      ? ""
      : "You should not call Impulse#setValue during rendering of watch(Component)",
  )
  @stopInsideContext(
    "useWatchImpulse",
    /* c8 ignore next 2 */
    process.env.NODE_ENV === "production"
      ? ""
      : "You should not call Impulse#setValue inside of the useWatchImpulse factory. The useWatchImpulse hook is for read-only operations but Impulse#setValue changes an existing Impulse.",
  )
  @stopInsideContext(
    "useImpulseMemo",
    /* c8 ignore next 2 */
    process.env.NODE_ENV === "production"
      ? ""
      : "You should not call Impulse#setValue inside of the useImpulseMemo factory. The useImpulseMemo hook is for read-only operations but Impulse#setValue changes an existing Impulse.",
  )
  public setValue(
    valueOrTransform: T | ((currentValue: T) => T),
    compare: null | Compare<T> = this.compare,
  ): void {
    const finalCompare = compare ?? eq

    this.emit(() => {
      const nextValue = isFunction(valueOrTransform)
        ? valueOrTransform(this.value)
        : valueOrTransform

      if (finalCompare(this.value, nextValue)) {
        return false
      }

      this.value = nextValue

      return true
    })
  }

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

    emitter.attachTo(this.emitters)

    return emitter.onEmit(listener)
  }
}
