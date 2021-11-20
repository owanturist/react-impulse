import {
  Dispatch,
  SetStateAction,
  useRef,
  useReducer,
  useEffect,
  useCallback
} from 'react'
import { nanoid } from 'nanoid'

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
  public static of<TValue>(value: TValue): InnerStore<TValue> {
    SynchronousContext.warning(
      'You should not call InnerStore.of(something) inside the useWatch(watcher) callback. ' +
        'he useWatch(watcher) hook is for read-only operations but InnerStore.of(something) creates one.'
    )

    return new InnerStore(value)
  }

  private readonly subscribers = new Map<string, VoidFunction>()

  public readonly key = nanoid()

  private constructor(private value: T) {}

  private emit(): void {
    this.subscribers.forEach(listener => listener())
  }

  public clone(transform?: (value: T) => T): InnerStore<T> {
    return InnerStore.of(
      typeof transform === 'function' ? transform(this.value) : this.value
    )
  }

  public getState(): T
  public getState<R>(transform: (value: T) => R): R
  public getState<R>(transform?: (value: T) => R): T | R {
    SynchronousContext.register(this)

    return typeof transform === 'function' ? transform(this.value) : this.value
  }

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

export type DeepExtractInnerState<T> = T extends InnerStore<infer R>
  ? DeepExtractInnerState<R>
  : T extends Array<infer R>
  ? Array<ExtractDeepDirect<R>>
  : T extends ReadonlyArray<infer R>
  ? ReadonlyArray<ExtractDeepDirect<R>>
  : { [K in keyof T]: ExtractDeepDirect<T[K]> }

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

export function useInnerState<T>(
  store: InnerStore<T>,
  compare?: Compare<T>
): [T, Dispatch<SetStateAction<T>>]
export function useInnerState<T>(
  store: null | InnerStore<T>,
  compare?: Compare<T>
): [null | T, Dispatch<SetStateAction<T>>]
export function useInnerState<T>(
  store: undefined | InnerStore<T>,
  compare?: Compare<T>
): [undefined | T, Dispatch<SetStateAction<T>>]
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

export function useInnerDispatch<T, A>(
  store: InnerStore<T>,
  update: (action: A, state: T) => T,
  compare?: Compare<T>
): [T, Dispatch<A>]
export function useInnerDispatch<T, A>(
  store: null | InnerStore<T>,
  update: (action: A, state: T) => T,
  compare?: Compare<T>
): [null | T, Dispatch<A>]
export function useInnerDispatch<T, A>(
  store: undefined | InnerStore<T>,
  update: (action: A, state: T) => T,
  compare?: Compare<T>
): [undefined | T, Dispatch<A>]
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
