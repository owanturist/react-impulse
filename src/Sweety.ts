import type { SetStateAction } from "react"
import { nanoid } from "nanoid"

import { Compare, isEqual, isFunction, noop } from "./utils"
import { WatchContext } from "./WatchContext"
import { SetStateContext } from "./SetStateContext"
import {
  WARNING_MESSAGE_CALLING_CLONE_WHEN_WATCHING,
  WARNING_MESSAGE_CALLING_OF_WHEN_WATCHING,
  WARNING_MESSAGE_CALLING_SET_STATE_WHEN_WATCHING,
  WARNING_MESSAGE_CALLING_SUBSCRIBE_WHEN_WATCHING,
} from "./validation"

export class Sweety<T> {
  /**
   * Creates a new `Sweety` instance.
   *
   * @param initialState the initial state.
   * @param compare an optional `Compare` function applied as `Sweety#compare`. When not defined or `null` then `Object.is` applies as a fallback.
   */
  public static of<TValue>(
    initialState: TValue,
    compare?: null | Compare<TValue>,
  ): Sweety<TValue> {
    WatchContext.warning(WARNING_MESSAGE_CALLING_OF_WHEN_WATCHING)

    return new Sweety(initialState, compare ?? isEqual)
  }

  /**
   * It does not use `Set<VoidFunction>` here because the same listener might be subscribed
   * many times to a Sweety instance, so it should not unsubscribe them all when one unsubscribes.
   * By keeping track of how many times the same listener is subscribed it knows when to drop
   * the listener from `subscribers`.
   */
  private readonly subscribers = new Map<VoidFunction, number>()
  // TODO delete
  public readonly key = nanoid()

  /**
   * The `Compare` function compares the state of a `Sweety` instance with the new state given via `Sweety#setState`.
   * Whenever the function returns `true`, neither the state change nor it notifies the listeners subscribed via `Sweety#subscribe`.
   */
  public readonly compare: Compare<T>

  private constructor(private value: T, compare: Compare<T>) {
    this.compare = compare
  }

  /**
   * Return the state when serializing to JSON.
   * It does not encode the Sweety instance for decoding it back due to runtime parts of the class,
   * that cannot be serialized as JSON.
   *
   * The method is protected in order to make it impossible to make the implicit call.
   *
   * @version 2.1.0
   */
  protected toJSON(): unknown {
    return this.value
  }

  /**
   * Return the stringified state when a Sweety instance converts to a string.
   *
   * The method is protected in order to make it impossible to make the implicit call.
   *
   * @version 2.1.0
   */
  protected toString(): string {
    return String(this.value)
  }

  /**
   * Clones a `Sweety` instance.
   *
   * @param transform an optional function that applies to the current state before cloning. It might be handy when cloning a state that contains mutable values.
   * @param compare an optional `Compare` function applied as `Sweety#compare`. When not defined, it uses the `Sweety#compare` function from the origin. When `null` the `Object.is` function applies to compare the states.
   */
  public clone(
    transform?: (value: T) => T,
    compare: null | Compare<T> = this.compare,
  ): Sweety<T> {
    WatchContext.warning(WARNING_MESSAGE_CALLING_CLONE_WHEN_WATCHING)

    return new Sweety(
      isFunction(transform) ? transform(this.value) : this.value,
      compare ?? isEqual,
    )
  }

  /**
   * Returns the current state.
   */
  public getState(): T
  /**
   * Returns a value selected from the current state.
   *
   * @param select an optional function that applies to the current state before returning.
   */
  public getState<R>(select: (value: T) => R): R
  public getState<R>(select?: (value: T) => R): T | R {
    WatchContext.register(this as Sweety<unknown>)

    return isFunction(select) ? select(this.value) : this.value
  }

  /**
   * Updates the state.
   * All listeners registered via the `Sweety#subscribe` method execute whenever the instance's state updates.
   *
   * @param stateOrTransform either the new state or a function that transforms the current state into the new state.
   * @param compare an optional `Compare` function applied for this call only. When not defined the `Sweety#compare` function of the instance will be used. When `null` the `Object.is` function applies to compare the states.
   *
   * @returns `void` to emphasize that `Sweety` instances are mutable.
   */
  public setState(
    stateOrTransform: SetStateAction<T>,
    compare: null | Compare<T> = this.compare,
  ): void {
    if (WatchContext.warning(WARNING_MESSAGE_CALLING_SET_STATE_WHEN_WATCHING)) {
      return
    }

    const finalCompare = compare ?? isEqual
    const [emit, register] = SetStateContext.registerStoreSubscribers()

    const nextValue = isFunction(stateOrTransform)
      ? stateOrTransform(this.value)
      : stateOrTransform

    if (!finalCompare(this.value, nextValue)) {
      this.value = nextValue
      register(this.subscribers)
    }

    emit()
  }

  /**
   * Subscribes to the state's updates caused by calling `Sweety#setState`.
   *
   * @param listener a function that subscribes to the updates.
   *
   * @returns a cleanup function that unsubscribes the `listener`.
   */
  public subscribe(listener: VoidFunction): VoidFunction {
    if (WatchContext.warning(WARNING_MESSAGE_CALLING_SUBSCRIBE_WHEN_WATCHING)) {
      return noop
    }

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
