import { noop } from "./utils"

export interface Subscriber {
  key: string
  subscribe(listener: VoidFunction): VoidFunction
}

const warning = (message: string): void => {
  /* istanbul ignore next */
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
  private static current: null | WatchContext = null
  private static isReadonlyDuringWatcherCall = false

  public static warning(message: string): boolean {
    if (WatchContext.isReadonlyDuringWatcherCall) {
      warning(message)
    }

    return WatchContext.isReadonlyDuringWatcherCall
  }

  public static executeWatcher<T>(watcher: () => T): T {
    WatchContext.isReadonlyDuringWatcherCall = true
    const value = watcher()
    WatchContext.isReadonlyDuringWatcherCall = false

    return value
  }

  public static register(store: Subscriber): void {
    WatchContext.current?.register(store)
  }

  private listener: VoidFunction = noop
  private readonly deadCleanups = new Set<string>()
  private readonly cleanups = new Map<string, VoidFunction>()

  private register(store: Subscriber): void {
    if (this.cleanups.has(store.key)) {
      // still alive
      this.deadCleanups.delete(store.key)
    } else {
      WatchContext.isReadonlyDuringWatcherCall = false
      this.cleanups.set(
        store.key,
        store.subscribe(() => this.cycle(this.listener)),
      )
      WatchContext.isReadonlyDuringWatcherCall = true
    }
  }

  private cleanupObsolete(): void {
    this.deadCleanups.forEach((key) => {
      const clean = this.cleanups.get(key)

      /* istanbul ignore next */
      if (clean != null) {
        clean()
        this.cleanups.delete(key)
      }
    })

    this.deadCleanups.clear()
  }

  private cycle(callback: VoidFunction): void {
    WatchContext.current = this

    // fill up dead cleanups with all of the current cleanups
    // to keep only real dead once during .register() call
    this.cleanups.forEach((_, key) => this.deadCleanups.add(key))

    callback()

    this.cleanupObsolete()

    WatchContext.current = null
  }

  public subscribe(listener: VoidFunction): VoidFunction {
    this.listener = listener

    return () => {
      this.cleanups.forEach((cleanup) => cleanup())
      this.cleanups.clear()
      this.deadCleanups.clear()
    }
  }

  public activate<T>(watcher: () => T): void {
    this.cycle(() => WatchContext.executeWatcher(watcher))
  }
}
