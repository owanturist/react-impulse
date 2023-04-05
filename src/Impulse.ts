import { Compare, isEqual, isFunction } from "./utils"
import { SetValueContext } from "./SetValueContext"
import { STATIC_SCOPE, SCOPE_KEY, Scope, extractScope } from "./Scope"

export class Impulse<T> {
  /**
   * Creates new Impulse.
   *
   * @param initialValue the initial value.
   * @param compare an optional `Compare` function applied as `Impulse#compare`. When not defined or `null` then `Object.is` applies as a fallback.
   *
   * @version 1.0.0
   */
  public static of<T>(
    initialValue: T,
    compare?: null | Compare<T>,
  ): Impulse<T> {
    return new Impulse(initialValue, compare ?? isEqual)
  }

  /**
   * It does not use `Set<VoidFunction>` here because the same listener might be subscribed
   * many times to an Impulse, so it should not unsubscribe them all when one unsubscribes.
   * By keeping track of how many times the same listener is subscribed it knows when to drop
   * the listener from `subscribers`.
   */
  private readonly subscribers = new Map<VoidFunction, number>()

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
    return this.getValue(extractScope() ?? STATIC_SCOPE)
  }

  /**
   * Return the stringified value when an Impulse converts to a string.
   *
   * The method is protected in order to make it impossible to make the implicit call.
   * @version 1.0.0
   */
  protected toString(): string {
    return String(this.getValue(extractScope() ?? STATIC_SCOPE))
  }

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
      isFunction(transform) ? transform(this.value) : this.value,
      compare ?? isEqual,
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
   * TODO update select docs with scope and add tests
   * @param select an optional function that applies to the current value before returning.
   *
   * @version 1.0.0
   */
  public getValue<R>(scope: Scope, select: (value: T, scope: Scope) => R): R
  public getValue<R>(
    scope: Scope,
    select?: (value: T, scope: Scope) => R,
  ): T | R {
    scope[SCOPE_KEY]?.register(this as Impulse<unknown>)

    return isFunction(select) ? select(this.value, scope) : this.value
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
  public setValue(
    valueOrTransform: T | ((currentValue: T) => T),
    compare: null | Compare<T> = this.compare,
  ): void {
    const finalCompare = compare ?? isEqual
    const [emit, register] = SetValueContext.registerStoreSubscribers()

    const nextValue = isFunction(valueOrTransform)
      ? valueOrTransform(this.value)
      : valueOrTransform

    if (!finalCompare(this.value, nextValue)) {
      this.value = nextValue
      register(this.subscribers)
    }

    emit()
  }

  /**
   * Subscribes to the value's updates caused by calling `Impulse#setValue`.
   *
   * @param listener a function that subscribes to the updates.
   *
   * @returns a cleanup function that unsubscribes the `listener`.
   *
   * @version 1.0.0
   */
  public subscribe(listener: VoidFunction): VoidFunction {
    const countWhenSubscribes = this.subscribers.get(listener) ?? 0

    this.subscribers.set(listener, countWhenSubscribes + 1)

    return () => {
      const countWhenUnsubscribes = this.subscribers.get(listener) ?? 0

      if (countWhenUnsubscribes > 1) {
        this.subscribers.set(listener, countWhenUnsubscribes - 1)
      } else {
        this.subscribers.delete(listener)
      }
    }
  }
}
