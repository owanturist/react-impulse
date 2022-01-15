import {
  Dispatch,
  SetStateAction,
  useRef,
  useReducer,
  useEffect,
  useCallback,
} from "react"
import { nanoid } from "nanoid"

/**
 * A function that compares two values and returns `true` if they are equal.
 * Depending on the type of the values it might be more efficient to use
 * a custom compare function such as shallow-equal or deep-equal.
 */
export type Compare<T> = (prev: T, next: T) => boolean

const isEqual = <T>(one: T, another: T): boolean => one === another

const noop: VoidFunction = () => {
  // do nothing
}

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

const warning = (message: string): void => {
  /* eslint-disable no-console */
  if (
    process.env.NODE_ENV !== "production" &&
    typeof console !== "undefined" &&
    typeof console.error === "function"
  ) {
    console.error(message)
  }
  /* eslint-enable no-console */
  try {
    // This error was thrown as a convenience so that if you enable
    // "break on all exceptions" in your console,
    // it would pause the execution at this line.
    throw new Error(message)
  } catch {
    // do nothing
  }
}

const modInc = (x: number): number => {
  return (x + 1) % 123456789
}

enum WatcherPermission {
  AllowAll = 0,
  AllowSubscribeOnly = 1,
  RestrictAll = 2,
}

class WatchContext {
  private static current: null | WatchContext = null
  private static watcherPermission = WatcherPermission.AllowAll

  public static warning(
    message: string,
    requiredPermission: WatcherPermission = WatcherPermission.AllowAll,
  ): boolean {
    if (WatchContext.watcherPermission <= requiredPermission) {
      return false
    }

    warning(message)

    return true
  }

  public static executeWatcher<T>(watcher: () => T): T {
    WatchContext.watcherPermission = WatcherPermission.RestrictAll
    const value = watcher()
    WatchContext.watcherPermission = WatcherPermission.AllowAll

    return value
  }

  public static register<T>(store: InnerStore<T>): void {
    WatchContext.current?.register(store)
  }

  private readonly deadCleanups = new Set<string>()
  private readonly cleanups = new Map<string, VoidFunction>()

  public constructor(private readonly listener: VoidFunction) {}

  private register<T>(store: InnerStore<T>): void {
    if (this.cleanups.has(store.key)) {
      // still alive
      this.deadCleanups.delete(store.key)
    } else {
      WatchContext.watcherPermission = WatcherPermission.AllowSubscribeOnly
      this.cleanups.set(store.key, store.subscribe(this.listener))
      WatchContext.watcherPermission = WatcherPermission.RestrictAll
    }
  }

  private cleanupObsolete(): void {
    this.deadCleanups.forEach((key) => {
      const clean = this.cleanups.get(key)

      if (clean != null) {
        clean()
        this.cleanups.delete(key)
      }
    })

    this.deadCleanups.clear()
  }

  public activate<T>(watcher: () => T): void {
    WatchContext.current = this

    // fill up dead cleanups with all of the current cleanups
    // to keep only real dead once during .register() call
    this.cleanups.forEach((_, key) => this.deadCleanups.add(key))

    WatchContext.executeWatcher(watcher)

    this.cleanupObsolete()

    WatchContext.current = null
  }

  public cleanup(): void {
    this.cleanups.forEach((cleanup) => cleanup())
    this.cleanups.clear()
    this.deadCleanups.clear()
  }
}

/**
 * A context that allows to collect setState subscribers and execute them all at once.
 * This is useful when multiple stores are updated at the same time.
 */
abstract class SetStateContext {
  private static subscribers: null | Array<Map<string, VoidFunction>> = null

  public static init(): [Dispatch<Map<string, VoidFunction>>, VoidFunction] {
    if (SetStateContext.subscribers != null) {
      const { subscribers } = SetStateContext

      // the context already exists - it should not emit anything at this point
      return [
        (subs) => {
          subscribers.push(subs)
        },
        noop,
      ]
    }

    // the first setState call should create the context and emit the listeners
    SetStateContext.subscribers = []

    const { subscribers } = SetStateContext

    return [
      (subs) => {
        subscribers.push(subs)
      },
      () => {
        const calledListeners = new WeakSet<VoidFunction>()

        for (const subs of subscribers) {
          subs.forEach((listener) => {
            // don't emit the same listener twice, for instance when using `useInnerWatch`
            if (!calledListeners.has(listener)) {
              listener()
              calledListeners.add(listener)
            }
          })
        }

        SetStateContext.subscribers = null
      },
    ]
  }
}

export class InnerStore<T> {
  /**
   * Creates a new `InnerStore` instance.
   * The instance is mutable so once created it should be used for all future operations.
   */
  public static of<TValue>(value: TValue): InnerStore<TValue> {
    WatchContext.warning(
      "You should not call InnerStore.of(something) inside the useInnerWatch(watcher) callback. " +
        "The useInnerWatch(watcher) hook is for read-only operations but InnerStore.of(something) creates one.",
    )

    return new InnerStore(value)
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

  private constructor(private value: T) {}

  /**
   * Clones a `InnerStore` instance.
   *
   * @param transform a function that will be applied to the current value before cloning.
   *
   * @returns new `InnerStore` instance with the same value.
   */
  public clone(transform?: (value: T) => T): InnerStore<T> {
    return InnerStore.of(
      typeof transform === "function" ? transform(this.value) : this.value,
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
   * @param compare a function with strict check (`===`) by default.
   *
   * @returns `void` to emphasize that `InnerStore` instances are mutable.
   *
   * @see {@link InnerStore.subscribe}
   * @see {@link Compare}
   */
  public setState(
    valueOrTransform: SetStateAction<T>,
    compare: Compare<T> = isEqual,
  ): void {
    if (
      WatchContext.warning(
        "You may not call InnerStore#setState(something) inside the useInnerWatch(watcher) callback. " +
          "The useInnerWatch(watcher) hook is for read-only operations but InnerStore#setState(something) changes it.",
      )
    ) {
      return
    }

    const [register, emit] = SetStateContext.init()

    const nextValue =
      typeof valueOrTransform === "function"
        ? (valueOrTransform as (value: T) => T)(this.value)
        : valueOrTransform

    if (!compare(this.value, nextValue)) {
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
    if (
      WatchContext.warning(
        "You should not call InnerStore#subscribe(listener) inside the useInnerWatch(watcher) callback. " +
          "The useInnerWatch(watcher) hook is for read-only operations but not for creating subscriptions.",
        WatcherPermission.AllowSubscribeOnly,
      )
    ) {
      return () => {
        // do nothing
      }
    }

    const subscriberId = nanoid()

    this.subscribers.set(subscriberId, listener)

    return () => {
      this.subscribers.delete(subscriberId)
    }
  }
}

/**
 * A hook that subscribes to all `InnerStore#getState` execution involved in the `watcher` call.
 * Due to the mutable nature of `InnerStore` instances a parent component won't be re-rendered when a child's `InnerStore` value is changed.
 * The hook gives a way to watch after deep changes in the store's values and trigger a re-render when the returning value is changed.
 *
 * @param watcher a function to read only the watching value meaning that it never should call `InnerStore.of`, `InnerStore#clone`, `InnerStore#setState` or `InnerStore#subscribe` methods inside.
 * @param compare a function with strict check (`===`) by default.
 *
 * @see {@link InnerStore.getState}
 * @see {@link Compare}
 */
export function useInnerWatch<T>(
  watcher: () => T,
  compare: Compare<T> = isEqual,
): T {
  const [x, render] = useReducer(modInc, 0)

  const valueRef = useRef<T>()
  const watcherRef = useRef<() => T>()
  // workaround to handle changes of the watcher returning value
  if (watcherRef.current !== watcher) {
    valueRef.current = WatchContext.executeWatcher(watcher)
  }

  const compareRef = useRef(compare)
  useEffect(() => {
    compareRef.current = compare
  }, [compare])

  // permanent ref
  const contextRef = useRef<WatchContext>()
  if (contextRef.current == null) {
    contextRef.current = new WatchContext(() => {
      const currentValue = valueRef.current!
      const nextValue = WatchContext.executeWatcher(watcherRef.current!)

      if (!compareRef.current(currentValue, nextValue)) {
        valueRef.current = nextValue
        render()
      }
    })
  }

  useEffect(() => {
    watcherRef.current = watcher
    contextRef.current!.activate(watcher)
  }, [x, watcher])

  // cleanup everything when unmounts
  useEffect(() => {
    return () => {
      contextRef.current!.cleanup()
    }
  }, [])

  return valueRef.current!
}

/**
 * A hooks that returns a function to update the store's value.
 * Might be useful when you need a way to update the store's value without subscribing to its changes.
 * The store won't update if the new value is comparably equal to the current value.
 *
 * @param store an `InnerStore` instance but can be `null` or `undefined` as a bypass when a store might be not defined.
 * @param compare a function with strict check (`===`) by default.
 *
 * @see {@link InnerStore.setState}
 * @see {@link Compare}
 */
export function useSetInnerState<T>(
  store: null | undefined | InnerStore<T>,
  compare: Compare<T> = isEqual,
): Dispatch<SetStateAction<T>> {
  const compareRef = useRef(compare)

  useEffect(() => {
    compareRef.current = compare
  }, [compare])

  return useCallback(
    (update): void => store?.setState(update, compareRef.current),
    [store],
  )
}

/**
 * A hooks that subscribes to the store's changes and returns the current value.
 *
 * @param store an `InnerStore` instance.
 *
 * @see {@link InnerStore.getState}
 * @see {@link InnerStore.subscribe}
 */
export function useGetInnerState<T>(store: InnerStore<T>): T

/**
 * A hooks that subscribes to the store's changes and returns the current value.
 *
 * @param store an `InnerStore` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
 *
 * @see {@link InnerStore.getState}
 * @see {@link InnerStore.subscribe}
 */
export function useGetInnerState<T>(store: null | InnerStore<T>): null | T

/**
 * A hooks that subscribes to the store's changes and returns the current value.
 *
 * @param store an `InnerStore` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
 *
 * @see {@link InnerStore.getState}
 * @see {@link InnerStore.subscribe}
 */
export function useGetInnerState<T>(
  store: undefined | InnerStore<T>,
): undefined | T

/**
 * A hooks that subscribes to the store's changes and returns the current value.
 *
 * @param store an `InnerStore` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
 *
 * @see {@link InnerStore.getState}
 * @see {@link InnerStore.subscribe}
 */
export function useGetInnerState<T>(
  store: null | undefined | InnerStore<T>,
): null | undefined | T

export function useGetInnerState<T>(
  store: null | undefined | InnerStore<T>,
): null | undefined | T {
  const [, render] = useReducer(modInc, 0)

  useEffect(() => {
    return store?.subscribe(render)
  }, [store])

  // with && operation it is possible to return `null` or `undefined`
  // but with ?. operation it might only return `undefined`
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return store && store.getState()
}

/**
 * A hook that is similar to `React.useState` but for `InnerStore` instances.
 * It subscribes to the store changes and returns the current value and a function to set the value.
 * The store won't update if the new value is comparably equal to the current value.
 *
 * @param store an `InnerStore` instance.
 * @param compare a function with strict check (`===`) by default.
 *
 * @see {@link InnerStore.getState}
 * @see {@link InnerStore.setState}
 * @see {@link InnerStore.subscribe}
 * @see {@link useGetInnerState}
 * @see {@link useSetInnerState}
 * @see {@link Compare}
 */
export function useInnerState<T>(
  store: InnerStore<T>,
  compare?: Compare<T>,
): [T, Dispatch<SetStateAction<T>>]

/**
 * The hook that is similar to `React.useState` but for `InnerStore` instances.
 * It subscribes to the store changes and returns the current value and a function to set the value.
 * The store won't update if the new value is comparably equal to the current value.
 *
 * @param store an `InnerStore` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
 * @param compare a function with strict check (`===`) by default.
 *
 * @see {@link InnerStore.getState}
 * @see {@link InnerStore.setState}
 * @see {@link InnerStore.subscribe}
 * @see {@link useGetInnerState}
 * @see {@link useSetInnerState}
 * @see {@link Compare}
 */
export function useInnerState<T>(
  store: null | InnerStore<T>,
  compare?: Compare<T>,
): [null | T, Dispatch<SetStateAction<T>>]

/**
 * A hook that is similar to `React.useState` but for `InnerStore` instances.
 * It subscribes to the store changes and returns the current value and a function to set the value.
 * The store won't update if the new value is comparably equal to the current value.
 *
 * @param store an `InnerStore` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
 * @param compare a function with strict check (`===`) by default.
 *
 * @see {@link InnerStore.getState}
 * @see {@link InnerStore.setState}
 * @see {@link InnerStore.subscribe}
 * @see {@link useGetInnerState}
 * @see {@link useSetInnerState}
 * @see {@link Compare}
 */
export function useInnerState<T>(
  store: undefined | InnerStore<T>,
  compare?: Compare<T>,
): [undefined | T, Dispatch<SetStateAction<T>>]

/**
 * A hook that is similar to `React.useState` but for `InnerStore` instances.
 * It subscribes to the store changes and returns the current value and a function to set the value.
 * The store won't update if the new value is comparably equal to the current value.
 *
 * @param store an `InnerStore` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
 * @param compare a function with strict check (`===`) by default.
 *
 * @see {@link InnerStore.getState}
 * @see {@link InnerStore.setState}
 * @see {@link InnerStore.subscribe}
 * @see {@link useGetInnerState}
 * @see {@link useSetInnerState}
 * @see {@link Compare}
 */
export function useInnerState<T>(
  store: null | undefined | InnerStore<T>,
  compare?: Compare<T>,
): [null | undefined | T, Dispatch<SetStateAction<T>>]

export function useInnerState<T>(
  store: null | undefined | InnerStore<T>,
  compare: Compare<T> = isEqual,
): [null | undefined | T, Dispatch<SetStateAction<T>>] {
  return [useGetInnerState(store), useSetInnerState(store, compare)]
}

/**
 * A hook that is similar to `React.useReducer` but for `InnerStore` instances.
 * It subscribes to the store changes and returns the current value and a function to set the value.
 * The store won't update if the new value is comparably equal to the current value.
 *
 * @param store an `InnerStore` instance.
 * @param reducer a function that transforms the current value and the dispatched action into the new value.
 * @param compare a function with strict check (`===`) by default.
 *
 * @see {@link InnerStore.getState}
 * @see {@link InnerStore.setState}
 * @see {@link InnerStore.subscribe}
 * @see {@link Compare}
 */
export function useInnerReducer<T, A>(
  store: InnerStore<T>,
  reducer: (state: T, action: A) => T,
  compare?: Compare<T>,
): [T, Dispatch<A>]

/**
 * A hook that is similar to `React.useReducer` but for `InnerStore` instances.
 * It subscribes to the store changes and returns the current value and a function to set the value.
 * The store won't update if the new value is comparably equal to the current value.
 *
 * @param store an `InnerStore` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
 * @param reducer a function that transforms the current value and the dispatched action into the new value.
 * @param compare a function with strict check (`===`) by default.
 *
 * @see {@link InnerStore.getState}
 * @see {@link InnerStore.setState}
 * @see {@link InnerStore.subscribe}
 * @see {@link Compare}
 */
export function useInnerReducer<T, A>(
  store: null | InnerStore<T>,
  reducer: (state: T, action: A) => T,
  compare?: Compare<T>,
): [null | T, Dispatch<A>]

/**
 * A hook that is similar to `React.useReducer` but for `InnerStore` instances.
 * It subscribes to the store changes and returns the current value and a function to set the value.
 * The store won't update if the new value is comparably equal to the current value.
 *
 * @param store an `InnerStore` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
 * @param reducer a function that transforms the current value and the dispatched action into the new value.
 * @param compare a function with strict check (`===`) by default.
 *
 * @see {@link InnerStore.getState}
 * @see {@link InnerStore.setState}
 * @see {@link InnerStore.subscribe}
 * @see {@link Compare}
 */
export function useInnerReducer<T, A>(
  store: undefined | InnerStore<T>,
  reducer: (state: T, action: A) => T,
  compare?: Compare<T>,
): [undefined | T, Dispatch<A>]

/**
 * A hook that is similar to `React.useReducer` but for `InnerStore` instances.
 * It subscribes to the store changes and returns the current value and a function to set the value.
 * The store won't update if the new value is comparably equal to the current value.
 *
 * @param store an `InnerStore` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
 * @param reducer a function that transforms the current value and the dispatched action into the new value.
 * @param compare a function with strict check (`===`) by default.
 *
 * @see {@link InnerStore.getState}
 * @see {@link InnerStore.setState}
 * @see {@link InnerStore.subscribe}
 * @see {@link Compare}
 */
export function useInnerReducer<T, A>(
  store: null | undefined | InnerStore<T>,
  reducer: (state: T, action: A) => T,
  compare?: Compare<T>,
): [null | undefined | T, Dispatch<A>]

export function useInnerReducer<T, A>(
  store: null | undefined | InnerStore<T>,
  reducer: (state: T, action: A) => T,
  compare: Compare<T> = isEqual,
): [null | undefined | T, Dispatch<A>] {
  const setState = useSetInnerState(store, compare)
  const reducerRef = useRef(reducer)

  useEffect(() => {
    reducerRef.current = reducer
  }, [reducer])

  return [
    useGetInnerState(store),
    useCallback(
      (action) => setState((state) => reducerRef.current(state, action)),
      [setState],
    ),
  ]
}
