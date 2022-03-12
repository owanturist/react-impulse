import { SetStateAction } from "react"
import { nanoid } from "nanoid"

import { Compare, isEqual, noop, overrideCompare } from "./utils"
import { Subscriber, WatchContext } from "./WatchContext"
import { SetStateContext } from "./SetStateContext"

type ExtractDirect<T> = T extends InnerStore<infer R> ? R : T

/**
 * A helper type that shallowly extracts value type from `InnerStore`.
 */
export type ExtractInnerState<T> = T extends InnerStore<infer R>
  ? R
  : T extends Array<infer R>
  ? Array<ExtractDirect<R>>
  : T extends ReadonlyArray<infer R>
  ? ReadonlyArray<ExtractDirect<R>>
  : { [K in keyof T]: ExtractDirect<T[K]> }

type ExtractDeepDirect<T> = T extends InnerStore<infer R>
  ? DeepExtractInnerState<R>
  : T

/**
 * A helper that deeply extracts value type from `InnerStore`.
 */
export type DeepExtractInnerState<T> = T extends InnerStore<infer R>
  ? DeepExtractInnerState<R>
  : T extends Array<infer R>
  ? Array<ExtractDeepDirect<R>>
  : T extends ReadonlyArray<infer R>
  ? ReadonlyArray<ExtractDeepDirect<R>>
  : { [K in keyof T]: ExtractDeepDirect<T[K]> }

const makeWarningMessage = ({
  isCritical,
  whatItDoes,
  method,
}: {
  isCritical: boolean
  whatItDoes: string
  method: string
}): string => {
  return [
    "You",
    isCritical ? "may not" : "should not",
    "call",
    method,
    "inside the useInnerWatch(watcher) callback.",
    "The useInnerWatch(watcher) hook is for read-only operations but",
    method,
    whatItDoes,
    ".",
  ].join(" ")
}

export const WARNING_MESSAGE_CALLING_OF_WHEN_WATCHING = makeWarningMessage({
  isCritical: false,
  whatItDoes: "creates a new store",
  method: "InnerStore#of(something)",
})

export const WARNING_MESSAGE_CALLING_CLONE_WHEN_WATCHING = makeWarningMessage({
  isCritical: false,
  whatItDoes: "creates a new store",
  method: "InnerStore#clone(transform?)",
})

export const WARNING_MESSAGE_CALLING_SET_STATE_WHEN_WATCHING =
  makeWarningMessage({
    isCritical: true,
    whatItDoes: "changes an existing store",
    method: "InnerStore#setState(something)",
  })

export const WARNING_MESSAGE_CALLING_SUBSCRIBE_WHEN_WATCHING =
  makeWarningMessage({
    isCritical: true,
    whatItDoes: "subscribes to a store",
    method: "InnerStore#subscribe(listener)",
  })

export class InnerStore<T> implements Subscriber {
  /**
   * Creates a new `InnerStore` instance.
   * The instance is mutable so once created it should be used for all future operations.
   * The `compare` function compares the value of the store with the new value given via `InnerStore#setState`.
   * If the function returns `true` the store will not be updated so no listeners subscribed via `InnerStore#subscribe` will be notified.
   *
   * @param value the initial immutable value.
   * @param compare an optional compare function with the lowest priority.
   * If not defined or `null` the strict equality check function (`===`) will be used.
   *
   * @see {@link Compare}
   * @see {@link InnerStore.setState}
   * @see {@link InnerStore.subscribe}
   */
  public static of<TValue>(
    value: TValue,
    compare?: null | Compare<TValue>,
  ): InnerStore<TValue> {
    WatchContext.warning(WARNING_MESSAGE_CALLING_OF_WHEN_WATCHING)

    return new InnerStore(value, compare ?? isEqual)
  }

  private readonly subscribers = new Map<string, VoidFunction>()

  /**
   * A unique key per `InnerStore` instance.
   * This key is used internally for `useInnerWatch`
   * but can be used as the React key property.
   *
   * @see {@link useInnerWatch}
   */
  public readonly key = nanoid()

  /**
   * A comparator function that compares the current store's value with the new one.
   *
   * @see {@link Compare}
   */
  public readonly compare: Compare<T>

  private constructor(private value: T, compare: Compare<T>) {
    this.compare = compare
  }

  /**
   * Clones a `InnerStore` instance.
   *
   * @param transform a function that will be applied to the current value before cloning.
   * @param compare an optional compare function.
   * If not defined it uses `InnerStore#compare`.
   * If `null` is passed the strict equality check function (`===`) will be used.
   *
   * @returns new `InnerStore` instance with the same value.
   *
   * @see {@link InnerStore.compare}
   * @see {@link Compare}
   */
  public clone(
    transform?: (value: T) => T,
    compare?: null | Compare<T>,
  ): InnerStore<T> {
    WatchContext.warning(WARNING_MESSAGE_CALLING_CLONE_WHEN_WATCHING)

    return new InnerStore(
      typeof transform === "function" ? transform(this.value) : this.value,
      overrideCompare(this.compare, compare),
    )
  }

  /**
   * An `InnerStore` instance's method that returns the current value.
   */
  public getState(): T
  /**
   * An `InnerStore` instance's method that returns the current value.
   *
   * @param transform a function that will be applied to the current value before returning.
   */
  public getState<R>(transform: (value: T) => R): R
  public getState<R>(transform?: (value: T) => R): T | R {
    WatchContext.register(this)

    return typeof transform === "function" ? transform(this.value) : this.value
  }

  /**
   * Sets the store's value.
   * Each time when the value is changed all of the store's listeners passed via `InnerStore#subscribe` are called.
   * If the new value is comparably equal to the current value neither the value is set nor the listeners are called.
   *
   * @param valueOrTransform either the new value or a function that will be applied to the current value before setting.
   * @param compare an optional compare function with medium priority.
   * If not defined it uses `InnerStore#compare`.
   * If `null` is passed the strict equality check function (`===`) will be used.
   *
   * @returns `void` to emphasize that `InnerStore` instances are mutable.
   *
   * @see {@link InnerStore.subscribe}
   * @see {@link InnerStore.compare}
   * @see {@link Compare}
   */
  public setState(
    valueOrTransform: SetStateAction<T>,
    compare?: null | Compare<T>,
  ): void {
    if (WatchContext.warning(WARNING_MESSAGE_CALLING_SET_STATE_WHEN_WATCHING)) {
      return
    }

    const finalCompare = overrideCompare(this.compare, compare)
    const [register, emit] = SetStateContext.init()

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
   * subscribes to the store's value changes caused by `InnerStore#setState` calls.
   *
   * @param listener a function that will be called on store updates.
   *
   * @returns a cleanup function that can be used to unsubscribe the listener.
   *
   * @see {@link InnerStore.setState}
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
