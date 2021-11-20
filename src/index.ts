import {
  Dispatch,
  SetStateAction,
  useRef,
  useReducer,
  useEffect,
  useCallback
} from 'react'
import { nanoid } from 'nanoid'

/**
 * A function that compares two values and returns `true` if they are equal.
 * Depending on the type of the values it might be more efficient to use
 * a custom compare function such as shallow-equal or deep-equal.
 */
export type Compare<T> = (prev: T, next: T) => boolean

const isEqual = <T>(one: T, another: T): boolean => one === another

const warning = (message: string): void => {
  /* eslint-disable no-console */
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
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

class SynchronousContext {
  private static current: null | SynchronousContext = null
  private static isWatcherExecuting = false
  private static isWatcherSubscribing = false

  public static warning(message: string): boolean {
    if (SynchronousContext.isWatcherSubscribing) {
      return false
    }

    if (
      SynchronousContext.current !== null ||
      SynchronousContext.isWatcherExecuting
    ) {
      if (process.env.NODE_ENV !== 'production') {
        warning(message)
      }

      return true
    }

    return false
  }

  public static executeWatcher<T>(watcher: () => T): T {
    SynchronousContext.isWatcherExecuting = true
    const value = watcher()
    SynchronousContext.isWatcherExecuting = false

    return value
  }

  public static register<T>(store: InnerStore<T>): void {
    const current = SynchronousContext.current

    if (current?.listener == null) {
      return
    }

    if (current.cleanups.has(store.key)) {
      current.deadCleanups.delete(store.key)
    } else {
      SynchronousContext.isWatcherSubscribing = true
      current.cleanups.set(store.key, store.subscribe(current.listener))
      SynchronousContext.isWatcherSubscribing = false
    }
  }

  private listener: null | VoidFunction = null
  private readonly deadCleanups = new Set<string>()
  private readonly cleanups = new Map<string, VoidFunction>()

  public activate(listener: VoidFunction): void {
    SynchronousContext.current = this
    this.listener = listener

    this.cleanups.forEach((_, key) => this.deadCleanups.add(key))
  }

  public cleanupObsolete(): void {
    SynchronousContext.current = null
    this.listener = null

    this.deadCleanups.forEach(key => {
      const clean = this.cleanups.get(key)

      if (typeof clean === 'function') {
        clean()
        this.cleanups.delete(key)
      }
    })

    this.deadCleanups.clear()
  }

  public cleanupAll(): void {
    this.listener = null
    this.cleanups.forEach(cleanup => cleanup())
    this.deadCleanups.clear()
  }
}

export class InnerStore<T> {
  /**
   * Creates a new `InnerStore` instance.
   * The instance is mutable so once created it should be used for all future operations.
   */
  public static of<TValue>(value: TValue): InnerStore<TValue> {
    SynchronousContext.warning(
      'You should not call InnerStore.of(something) inside the useWatch(watcher) callback. ' +
        'he useWatch(watcher) hook is for read-only operations but InnerStore.of(something) creates one.'
    )

    return new InnerStore(value)
  }

  private readonly subscribers = new Map<string, VoidFunction>()

  /**
   * A unique key per `InnerStore` instance.
   * This key is used internally for useInnerWatch
   * but can be used as the React key for the component.
   *
   * @see {@link useInnerWatch}
   */
  public readonly key = nanoid()

  private constructor(private value: T) {}

  private emit(): void {
    this.subscribers.forEach(listener => listener())
  }

  /**
   * Clones a `InnerStore` instance.
   *
   * @param transform optional function that is applied to the value before cloning
   * @returns new `InnerStore` instance with the same value.
   */
  public clone(transform?: (value: T) => T): InnerStore<T> {
    return InnerStore.of(
      typeof transform === 'function' ? transform(this.value) : this.value
    )
  }

  /**
   * An `InnerStore` instance's method that returns the current value.
   */
  public getState(): T
  /**
   * An `InnerStore` instance's method that returns the current value.
   *
   * @param transform function that is applied to the value before returning.
   */
  public getState<R>(transform: (value: T) => R): R
  public getState<R>(transform?: (value: T) => R): T | R {
    SynchronousContext.register(this)

    return typeof transform === 'function' ? transform(this.value) : this.value
  }

  /**
   * Sets the store's value.
   * Each time when the value is changed all listeners defined with `InnerStore#subscribe` are called.
   * If the new value is equal to the current value neither the value is set nor listeners are called.
   *
   * @param transformOrValue either a value or a `transform` function that is applied to the value before setting.
   * @param compare function that is used to compare the new value with the current value.
   * @returns `void` to emphasize that `InnerStore` instances are mutable.
   *
   * @see {@link InnerStore.subscribe}
   * @see {@link Compare}
   */
  public setState(
    transformOrValue: SetStateAction<T>,
    compare: Compare<T> = isEqual
  ): void {
    if (
      SynchronousContext.warning(
        'You may not call InnerStore#setState(something) inside the useWatch(watcher) callback. ' +
          'The useWatch(watcher) hook is for read-only operations but InnerStore#setState(something) changes it.'
      )
    ) {
      return
    }

    const nextValue =
      typeof transformOrValue === 'function'
        ? (transformOrValue as (value: T) => T)(this.value)
        : transformOrValue

    if (!compare(this.value, nextValue)) {
      this.value = nextValue
      this.emit()
    }
  }

  /**
   * Adds a listener that is called each time when the value is changed via `InnerStore#setState`.
   *
   * @returns an unsubscribe function that can be used to remove the listener.
   */
  public subscribe(listener: VoidFunction): VoidFunction {
    if (
      SynchronousContext.warning(
        'You should not call InnerStore#subscribe(listener) inside the useWatch(watcher) callback. ' +
          'The useWatch(watcher) hook is for read-only operations but not for creating subscriptions.'
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

/**
 * The hooks that returns a function to update the store's value.
 * Might be useful when you need a way to update the store's value without subscribing to its changes.
 * The store won't update if the new value is equal to the current value.
 *
 * @param store the store to update
 * @param compare function that is used to compare the new value with the current value.
 * @returns
 *
 * @see {@link InnerStore.setState}
 */
export function useInnerUpdate<T>(
  store: null | undefined | InnerStore<T>,
  compare: Compare<T> = isEqual
): Dispatch<SetStateAction<T>> {
  const compareRef = useRef(compare)

  useEffect(() => {
    compareRef.current = compare
  }, [compare])

  return useCallback(
    (update): void => store?.setState(update, compareRef.current),
    [store]
  )
}

/**
 * The hook that subscribes to all `InnerStore#getState` execution involved in the `watcher` call.
 * Due to the mutable nature of `InnerStore` instances a parent component won't be re-rendered
 * when a child's `InnerStore` value is changed.
 * The hook gives a way to watch after deep changes in the store's values
 * and trigger a re-render when the value is changed.
 * The store won't update if the watching value is not changed.
 *
 * @param watcher
 * @param compare function that is used to compare the new value with the current value.
 *
 * @see {@link InnerStore.getState}
 */
export function useInnerWatch<T>(
  watcher: () => T,
  compare: Compare<T> = isEqual
): T {
  const [x, render] = useReducer(modInc, 0)
  // the flag is shared across all .activate listeners
  // created in different useEffect ticks
  const isRenderTriggeredRef = useRef(false)

  // workaround to handle changes of the watcher returning value
  const valueRef = useRef<T>()
  const watcherRef = useRef<() => T>()
  if (watcherRef.current !== watcher) {
    valueRef.current = SynchronousContext.executeWatcher(watcher)
  }

  // permanent ref
  const contextRef = useRef<SynchronousContext>()
  if (contextRef.current == null) {
    contextRef.current = new SynchronousContext()
  }

  // no need to re-register .getState calls when compare changes
  // it is only needed when watcher calls inside .activate listener
  const compareRef = useRef(compare)
  useEffect(() => {
    compareRef.current = compare
  }, [compare])

  useEffect(() => {
    isRenderTriggeredRef.current = false

    contextRef.current!.activate(() => {
      const currentValue = valueRef.current!
      const nextValue = SynchronousContext.executeWatcher(watcherRef.current!)

      valueRef.current = nextValue

      // no need to listen for all .getState updates
      // the only one is enough to trigger the render
      if (
        !isRenderTriggeredRef.current &&
        !compareRef.current(currentValue, nextValue)
      ) {
        isRenderTriggeredRef.current = true
        render()
      }
    })

    // register .getState() calls
    watcherRef.current = watcher
    valueRef.current = SynchronousContext.executeWatcher(watcher)

    contextRef.current!.cleanupObsolete()
  }, [x, watcher])

  // cleanup everything when unmounts
  useEffect(() => {
    return () => {
      contextRef.current!.cleanupAll()
    }
  }, [])

  return valueRef.current!
}

/**
 * The hook that is similar to `React.useState` but for `InnerStore` instances.
 * It subscribes to the store and returns the current value and a function to set the value.
 * The store won't update if the new value is equal to the current value.
 *
 * @param store the store to subscribe to.
 * @param compare function that is used to compare the new value with the current value.
 *
 * @see {@link InnerStore.getState}
 * @see {@link InnerStore.setState}
 * @see {@link InnerStore.subscribe}
 */
export function useInnerState<T>(
  store: InnerStore<T>,
  compare?: Compare<T>
): [T, Dispatch<SetStateAction<T>>]

/**
 * The hook that is similar to `React.useState` but for `InnerStore` instances.
 * It subscribes to the store and returns the current value and a function to set the value.
 * The store won't update if the new value is equal to the current value.
 *
 * @param store the nullable store to subscribe to is a bypass when there is no need to subscribe to the store's changes.
 * @param compare function that is used to compare the new value with the current value.
 *
 * @see {@link InnerStore.getState}
 * @see {@link InnerStore.setState}
 * @see {@link InnerStore.subscribe}
 */
export function useInnerState<T>(
  store: null | InnerStore<T>,
  compare?: Compare<T>
): [null | T, Dispatch<SetStateAction<T>>]

/**
 * The hook that is similar to `React.useState` but for `InnerStore` instances.
 * It subscribes to the store and returns the current value and a function to set the value.
 * The store won't update if the new value is equal to the current value.
 *
 * @param store the nullable store to subscribe to is a bypass when there is no need to subscribe to the store's changes.
 * @param compare function that is used to compare the new value with the current value.
 *
 * @see {@link InnerStore.getState}
 * @see {@link InnerStore.setState}
 * @see {@link InnerStore.subscribe}
 */
export function useInnerState<T>(
  store: undefined | InnerStore<T>,
  compare?: Compare<T>
): [undefined | T, Dispatch<SetStateAction<T>>]

/**
 * The hook that is similar to `React.useState` but for `InnerStore` instances.
 * It subscribes to the store and returns the current value and a function to set the value.
 * The store won't update if the new value is equal to the current value.
 *
 * @param store the nullable store to subscribe to is a bypass when there is no need to subscribe to the store's changes.
 * @param compare function that is used to compare the new value with the current value.
 *
 * @see {@link InnerStore.getState}
 * @see {@link InnerStore.setState}
 * @see {@link InnerStore.subscribe}
 */
export function useInnerState<T>(
  store: null | undefined | InnerStore<T>,
  compare?: Compare<T>
): [null | undefined | T, Dispatch<SetStateAction<T>>]

export function useInnerState<T>(
  store: null | undefined | InnerStore<T>,
  compare: Compare<T> = isEqual
): [null | undefined | T, Dispatch<SetStateAction<T>>] {
  const [, render] = useReducer(modInc, 0)

  useEffect(() => {
    return store?.subscribe(render)
  }, [store])

  return [store?.getState(), useInnerUpdate(store, compare)]
}

/**
 * The hook that is similar to `React.useDispatch` but for `InnerStore` instances.
 * It subscribes to the store and returns the current value and a function to dispatch an action.
 * It won't trigger a re-render if the new value is equal to the current value.
 *
 * @param store the store to subscribe to.
 * @param update the function that is used to update the store's value.
 * @param compare function that is used to compare the new value with the current value.
 *
 * @see {@link InnerStore.getState}
 * @see {@link InnerStore.setState}
 * @see {@link InnerStore.subscribe}
 */
export function useInnerDispatch<T, A>(
  store: InnerStore<T>,
  update: (action: A, state: T) => T,
  compare?: Compare<T>
): [T, Dispatch<A>]

/**
 * The hook that is similar to `React.useDispatch` but for `InnerStore` instances.
 * It subscribes to the store and returns the current value and a function to dispatch an action.
 * It won't trigger a re-render if the new value is equal to the current value.
 *
 * @param store the nullable store to subscribe to is a bypass when there is no need to subscribe to the store's changes.
 * @param update the function that is used to update the store's value.
 * @param compare function that is used to compare the new value with the current value.
 *
 * @see {@link InnerStore.getState}
 * @see {@link InnerStore.setState}
 * @see {@link InnerStore.subscribe}
 */
export function useInnerDispatch<T, A>(
  store: null | InnerStore<T>,
  update: (action: A, state: T) => T,
  compare?: Compare<T>
): [null | T, Dispatch<A>]

/**
 * The hook that is similar to `React.useDispatch` but for `InnerStore` instances.
 * It subscribes to the store and returns the current value and a function to dispatch an action.
 * It won't trigger a re-render if the new value is equal to the current value.
 *
 * @param store the nullable store to subscribe to is a bypass when there is no need to subscribe to the store's changes.
 * @param update the function that is used to update the store's value.
 * @param compare function that is used to compare the new value with the current value.
 *
 * @see {@link InnerStore.getState}
 * @see {@link InnerStore.setState}
 * @see {@link InnerStore.subscribe}
 */
export function useInnerDispatch<T, A>(
  store: undefined | InnerStore<T>,
  update: (action: A, state: T) => T,
  compare?: Compare<T>
): [undefined | T, Dispatch<A>]

/**
 * The hook that is similar to `React.useDispatch` but for `InnerStore` instances.
 * It subscribes to the store and returns the current value and a function to dispatch an action.
 * It won't trigger a re-render if the new value is equal to the current value.
 *
 * @param store the nullable store to subscribe to is a bypass when there is no need to subscribe to the store's changes.
 * @param update the function that is used to update the store's value.
 * @param compare function that is used to compare the new value with the current value.
 *
 * @see {@link InnerStore.getState}
 * @see {@link InnerStore.setState}
 * @see {@link InnerStore.subscribe}
 */
export function useInnerDispatch<T, A>(
  store: null | undefined | InnerStore<T>,
  update: (action: A, state: T) => T,
  compare?: Compare<T>
): [null | undefined | T, Dispatch<A>]

export function useInnerDispatch<T, A>(
  store: null | undefined | InnerStore<T>,
  update: (action: A, state: T) => T,
  compare: Compare<T> = isEqual
): [null | undefined | T, Dispatch<A>] {
  const [state, setState] = useInnerState(store, compare)
  const updateRef = useRef(update)

  useEffect(() => {
    updateRef.current = update
  }, [update])

  return [
    state,
    useCallback(
      action => {
        return setState(currentState => updateRef.current(action, currentState))
      },
      [setState]
    )
  ]
}
