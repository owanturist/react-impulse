import {
  Dispatch,
  SetStateAction,
  useRef,
  useReducer,
  useEffect,
  useCallback
} from 'react'
import deepCompare from 'deep-equal'
import shallowCompare from 'shallowequal'
import { nanoid } from 'nanoid'

import { warning } from './warning'

export type Comparator<T> =
  | 'strict'
  | 'shallow'
  | 'deep'
  | ((prev: T, next: T) => boolean)

export const compare = <T>(
  prev: T,
  next: T,
  comparator: Comparator<T> = 'strict'
): boolean => {
  switch (comparator) {
    case 'strict': {
      return prev === next
    }

    case 'shallow': {
      return shallowCompare(prev, next)
    }

    case 'deep': {
      return deepCompare(prev, next)
    }

    default: {
      return comparator(prev, next)
    }
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

  public static register<T>(microState: MicroStore<T>): void {
    const current = SynchronousContext.current

    if (current?.listener == null) {
      return
    }

    if (current.cleanups.has(microState.key)) {
      current.deadCleanups.delete(microState.key)
    } else {
      SynchronousContext.isWatcherSubscribing = true
      current.cleanups.set(
        microState.key,
        microState.subscribe(current.listener)
      )
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

export class MicroStore<T> {
  public static of<TValue>(value: TValue): MicroStore<TValue> {
    SynchronousContext.warning(
      'You should not call MicroState.of(something) inside the useWatch(watcher) callback. ' +
        'he useWatch(watcher) hook is for read-only operations but MicroState.of(something) creates one.'
    )

    return new MicroStore(value)
  }

  private readonly subscribers = new Map<string, VoidFunction>()

  public readonly key = nanoid()

  private constructor(private value: T) {}

  private emit(): void {
    this.subscribers.forEach(listener => listener())
  }

  public clone(): MicroStore<T>
  public clone<R>(fn: (value: T) => R): MicroStore<R>
  public clone<R>(fn?: (value: T) => R): MicroStore<T | R> {
    return MicroStore.of(typeof fn === 'function' ? fn(this.value) : this.value)
  }

  public setState(
    fnOrValue: T | ((value: T) => T),
    comparator: Comparator<T> = 'strict'
  ): void {
    if (
      SynchronousContext.warning(
        'You may not call microState.setState(something) inside the useWatch(watcher) callback. ' +
          'The useWatch(watcher) hook is for read-only operations but microState.setState(something) changes it.'
      )
    ) {
      return
    }

    const nextValue =
      typeof fnOrValue === 'function'
        ? (fnOrValue as (value: T) => T)(this.value)
        : fnOrValue

    if (!compare(this.value, nextValue, comparator)) {
      this.value = nextValue
      this.emit()
    }
  }

  public subscribe(listener: VoidFunction): VoidFunction {
    if (
      SynchronousContext.warning(
        'You should not call microState.subscribe(listener) inside the useWatch(watcher) callback. ' +
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

  public getState(): T
  public getState<R>(fn: (value: T) => R): R
  public getState<R>(fn?: (value: T) => R): T | R {
    SynchronousContext.register(this)

    return typeof fn === 'function' ? fn(this.value) : this.value
  }
}

type UnpackDirect<T> = T extends MicroStore<infer R> ? R : T

export type GetMicroState<T> = T extends MicroStore<infer R>
  ? R
  : T extends Array<infer R>
  ? Array<UnpackDirect<R>>
  : T extends ReadonlyArray<infer R>
  ? ReadonlyArray<UnpackDirect<R>>
  : { [K in keyof T]: UnpackDirect<T[K]> }

export function useMicroUpdate<T>(
  microStore: null | undefined | MicroStore<T>,
  comparator: Comparator<T> = 'strict'
): Dispatch<SetStateAction<T>> {
  return useCallback(
    (update): void => {
      microStore?.setState(update, comparator)
    },
    [microStore, comparator]
  )
}

export function useMicroWatch<T>(
  watcher: () => T,
  comparator: Comparator<T> = 'strict'
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

  // no need to re-register .getState calls when comparator changes
  // it is only needed when watcher calls inside .activate listener
  const comparatorRef = useRef(comparator)
  useEffect(() => {
    comparatorRef.current = comparator
  }, [comparator])

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
        !compare(currentValue, nextValue, comparatorRef.current)
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

export function useMicroState<T>(
  microState: MicroStore<T>,
  comparator?: Comparator<T>
): [T, Dispatch<SetStateAction<T>>]
export function useMicroState<T>(
  microState: null | MicroStore<T>,
  comparator?: Comparator<T>
): [null | T, Dispatch<SetStateAction<T>>]
export function useMicroState<T>(
  microState: undefined | MicroStore<T>,
  comparator?: Comparator<T>
): [undefined | T, Dispatch<SetStateAction<T>>]
export function useMicroState<T>(
  microState: null | undefined | MicroStore<T>,
  comparator?: Comparator<T>
): [null | undefined | T, Dispatch<SetStateAction<T>>]
export function useMicroState<T>(
  microState: null | undefined | MicroStore<T>,
  comparator: Comparator<T> = 'strict'
): [null | undefined | T, Dispatch<SetStateAction<T>>] {
  const [, render] = useReducer(modInc, 0)

  useEffect(() => {
    return microState?.subscribe(render)
  }, [microState])

  return [microState?.getState(), useMicroUpdate(microState, comparator)]
}

export function useMicroDispatch<T, A>(
  microState: MicroStore<T>,
  update: (action: A, state: T) => T,
  comparator?: Comparator<T>
): [T, Dispatch<A>]
export function useMicroDispatch<T, A>(
  microState: null | MicroStore<T>,
  update: (action: A, state: T) => T,
  comparator?: Comparator<T>
): [null | T, Dispatch<A>]
export function useMicroDispatch<T, A>(
  microState: undefined | MicroStore<T>,
  update: (action: A, state: T) => T,
  comparator?: Comparator<T>
): [undefined | T, Dispatch<A>]
export function useMicroDispatch<T, A>(
  microState: null | undefined | MicroStore<T>,
  update: (action: A, state: T) => T,
  comparator?: Comparator<T>
): [null | undefined | T, Dispatch<A>]
export function useMicroDispatch<T, A>(
  microState: null | undefined | MicroStore<T>,
  update: (action: A, state: T) => T,
  comparator: Comparator<T> = 'strict'
): [null | undefined | T, Dispatch<A>] {
  const [state, setState] = useMicroState(microState, comparator)
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
