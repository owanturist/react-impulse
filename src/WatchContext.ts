import type { Dispatch } from "react"

import type { Sweety } from "./Sweety"
import { SetStateContext } from "./SetStateContext"

const warning = (message: string): void => {
  if (
    (process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "test") &&
    typeof console !== "undefined" &&
    // eslint-disable-next-line no-console
    typeof console.error === "function"
  ) {
    // eslint-disable-next-line no-console
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

/**
 * A context to track Sweety#getState() usage inside the watcher function.
 * The tracked calls will subscribe related stores to updates,
 * so the watcher will execute on each update.
 *
 * @private
 */
export class WatchContext {
  public static current: null | WatchContext = null
  private static isReadonlyDuringWatcherCall = false

  public static warning(message: string): boolean {
    if (WatchContext.isReadonlyDuringWatcherCall) {
      warning(message)
    }

    return WatchContext.isReadonlyDuringWatcherCall
  }

  public static register<T>(store: Sweety<T>): void {
    WatchContext.current?.register(store)
  }

  private static executeWatcher<T>(watcher: () => T): T {
    WatchContext.isReadonlyDuringWatcherCall = true
    const value = watcher()
    WatchContext.isReadonlyDuringWatcherCall = false

    return value
  }

  private readonly listeners = new Set<
    (stores: Array<Sweety<unknown>>) => null | Dispatch<Array<Sweety<unknown>>>
  >()
  private readonly deadCleanups = new Set<Sweety<any>>()
  private readonly cleanups = new Map<Sweety<any>, VoidFunction>()

  private register<T>(store: Sweety<T>): void {
    if (this.cleanups.has(store)) {
      // still alive
      this.deadCleanups.delete(store)
    } else {
      WatchContext.isReadonlyDuringWatcherCall = false
      this.cleanups.set(
        store,
        store.subscribe(() => {
          // the listener registers a watcher so the watcher will emit once per (batch) setState
          SetStateContext.registerWatchContext(this)
        }),
      )
      WatchContext.isReadonlyDuringWatcherCall = true
    }
  }

  private cleanupObsolete(): void {
    this.deadCleanups.forEach((store) => {
      const clean = this.cleanups.get(store)

      if (clean != null) {
        clean()
        this.cleanups.delete(store)
      }
    })

    this.deadCleanups.clear()
  }

  private cycle<T>(callback: (stores: Array<Sweety<unknown>>) => T): T {
    WatchContext.current = this

    // fill up dead cleanups with all of the current cleanups
    // to keep only real dead once during .register() call
    this.cleanups.forEach((_, store) => this.deadCleanups.add(store))

    const value = callback(Array.from(this.cleanups.keys()))

    this.cleanupObsolete()

    WatchContext.current = null

    return value
  }

  public subscribeOnWatchedStores(
    listener: (
      stores: Array<Sweety<unknown>>,
    ) => null | Dispatch<Array<Sweety<unknown>>>,
  ): VoidFunction {
    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)

      if (this.listeners.size === 0) {
        this.cleanups.forEach((cleanup) => cleanup())
        this.cleanups.clear()
        this.deadCleanups.clear()
      }
    }
  }

  public watchStores<T>(watcher: () => T): T {
    return this.cycle(() => WatchContext.executeWatcher(watcher))
  }

  public emit(): void {
    this.listeners.forEach((listener) => {
      const callback = listener(Array.from(this.cleanups.keys()))

      if (callback != null) {
        this.cycle(callback)
      }
    })
  }
}
