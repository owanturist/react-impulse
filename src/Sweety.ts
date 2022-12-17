import type { SetStateAction } from "react"
import { nanoid } from "nanoid"

import { Compare, isEqual, noop, overrideCompare } from "./utils"
import { WatchContext } from "./WatchContext"
import { SetStateContext } from "./SetStateContext"
import {
  WARNING_MESSAGE_CALLING_CLONE_WHEN_WATCHING,
  WARNING_MESSAGE_CALLING_OF_WHEN_WATCHING,
  WARNING_MESSAGE_CALLING_SET_STATE_WHEN_WATCHING,
  WARNING_MESSAGE_CALLING_SUBSCRIBE_WHEN_WATCHING,
} from "./validation"

type ExtractDirect<T> = T extends Sweety<infer R> ? R : T

/**
 * A helper type that shallowly extracts value type from `Sweety`.
 */
export type ExtractSweetyState<T> = T extends Sweety<infer R>
  ? R
  : T extends Array<infer R>
  ? Array<ExtractDirect<R>>
  : T extends ReadonlyArray<infer R>
  ? ReadonlyArray<ExtractDirect<R>>
  : { [K in keyof T]: ExtractDirect<T[K]> }

type ExtractDeepDirect<T> = T extends Sweety<infer R>
  ? DeepExtractSweetyState<R>
  : T

/**
 * A helper that deeply extracts value type from `Sweety`.
 */
export type DeepExtractSweetyState<T> = T extends Sweety<infer R>
  ? DeepExtractSweetyState<R>
  : T extends Array<infer R>
  ? Array<ExtractDeepDirect<R>>
  : T extends ReadonlyArray<infer R>
  ? ReadonlyArray<ExtractDeepDirect<R>>
  : { [K in keyof T]: ExtractDeepDirect<T[K]> }

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

  // it should keep the listeners in a Map by a uniq key because
  // the same listener can be added multiple times
  private readonly subscribers = new Map<string, VoidFunction>()

  /**
   * A unique key per `Sweety` instance.
   */
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
   * Clones a `Sweety` instance.
   *
   * @param transform an optional function that applies to the current state before cloning. It might be handy when cloning a state that contains mutable values.
   * @param compare an optional `Compare` function applied as `Sweety#compare`. When not defined, it uses the `Sweety#compare` function from the origin. When `null` the `Object.is` function applies to compare the states.
   */
  public clone(
    transform?: (value: T) => T,
    compare?: null | Compare<T>,
  ): Sweety<T> {
    WatchContext.warning(WARNING_MESSAGE_CALLING_CLONE_WHEN_WATCHING)

    return new Sweety(
      typeof transform === "function" ? transform(this.value) : this.value,
      overrideCompare(this.compare, compare),
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
    WatchContext.register(this)

    return typeof select === "function" ? select(this.value) : this.value
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
    compare?: null | Compare<T>,
  ): void {
    if (WatchContext.warning(WARNING_MESSAGE_CALLING_SET_STATE_WHEN_WATCHING)) {
      return
    }

    const finalCompare = overrideCompare(this.compare, compare)
    const [emit, register] = SetStateContext.registerStoreSubscribers()

    const nextValue =
      typeof stateOrTransform === "function"
        ? (stateOrTransform as (value: T) => T)(this.value)
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

    const subscriberId = nanoid()

    this.subscribers.set(subscriberId, listener)

    return () => {
      this.subscribers.delete(subscriberId)
    }
  }
}
