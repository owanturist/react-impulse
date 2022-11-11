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
   * Creates a new `Sweety` store instance.
   * The instance is mutable so once created it should be used for all future operations.
   * The `compare` function compares the value of the store with the new value given via `Sweety#setState`.
   * If the function returns `true` the store will not be updated so no listeners subscribed via `Sweety#subscribe` will be notified.
   *
   * @param value the initial immutable value.
   * @param compare an optional compare function with the lowest priority.
   * If not defined or `null` the strict equality check function (`===`) will be used.
   */
  public static of<TValue>(
    value: TValue,
    compare?: null | Compare<TValue>,
  ): Sweety<TValue> {
    WatchContext.warning(WARNING_MESSAGE_CALLING_OF_WHEN_WATCHING)

    return new Sweety(value, compare ?? isEqual)
  }

  // it should keep the listeners in a Map by a uniq key because
  // the same listener can be added multiple times
  private readonly subscribers = new Map<string, VoidFunction>()

  /**
   * A unique key per `Sweety` instance.
   * This key is used internally for `useWatchSweety`
   * but can be used as the React key property.
   *
   */
  public readonly key = nanoid()

  /**
   * A comparator function that compares the current store's value with the new one.
   */
  public readonly compare: Compare<T>

  private constructor(private value: T, compare: Compare<T>) {
    this.compare = compare
  }

  /**
   * Clones a `Sweety` instance.
   *
   * @param transform a function that will be applied to the current value before cloning.
   * @param compare an optional compare function.
   * If not defined it uses `Sweety#compare`.
   * If `null` is passed the strict equality check function (`===`) will be used.
   *
   * @returns new `Sweety` instance with the same value.
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
   * A `Sweety` instance's method that returns the current value.
   */
  public getState(): T
  /**
   * A `Sweety` instance's method that returns the current value.
   *
   * @param transform a function that will be applied to the current value before returning.
   */
  public getState<R>(transform: (value: T) => R): R
  public getState<R>(transform?: (value: T) => R): T | R {
    WatchContext.register(this)

    return typeof transform === "function" ? transform(this.value) : this.value
  }

  /**
   * Sets the Sweety's value.
   * Each time when the value is changed all of the store's listeners passed via `Sweety#subscribe` are called.
   * If the new value is comparably equal to the current value neither the value is set nor the listeners are called.
   *
   * @param valueOrTransform either the new value or a function that will be applied to the current value before setting.
   * @param compare an optional compare function with medium priority.
   * If not defined it uses `Sweety#compare`.
   * If `null` is passed the strict equality check function (`===`) will be used.
   *
   * @returns `void` to emphasize that `Sweety` instances are mutable.
   */
  public setState(
    valueOrTransform: SetStateAction<T>,
    compare?: null | Compare<T>,
  ): void {
    if (WatchContext.warning(WARNING_MESSAGE_CALLING_SET_STATE_WHEN_WATCHING)) {
      return
    }

    const finalCompare = overrideCompare(this.compare, compare)
    const [emit, register] = SetStateContext.registerStoreSubscribers()

    const nextValue =
      typeof valueOrTransform === "function"
        ? (valueOrTransform as (value: T) => T)(this.value)
        : valueOrTransform

    if (!finalCompare(this.value, nextValue)) {
      this.value = nextValue
      register(this.subscribers)
    }

    emit()
  }

  /**
   * Subscribes to the Sweety's value changes caused by `Sweety#setState` calls.
   *
   * @param listener a function that will be called on store updates.
   *
   * @returns a cleanup function that can be used to unsubscribe the listener.
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
