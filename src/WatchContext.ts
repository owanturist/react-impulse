import type { Impulse } from "./Impulse"
import { SetStateContext } from "./SetStateContext"
import { isFunction, noop } from "./utils"
import { WarningSet, WarningSource } from "./validation"

/**
 * A context to track Impulse#getState() usage inside the watcher function.
 * The tracked calls will subscribe related stores to updates,
 * so the watcher will execute on each update.
 *
 * @private
 */
export class WatchContext {
  private static current: null | WatchContext = null

  public static warning(warningSet: WarningSet): boolean {
    const warningSource = WatchContext.current?.warningSource
    const message = warningSource == null ? null : warningSet[warningSource]

    if (message == null) {
      return false
    }

    if (
      typeof console !== "undefined" &&
      // eslint-disable-next-line no-console
      isFunction(console.error)
    ) {
      // eslint-disable-next-line no-console
      console.error(message)
    }

    try {
      // This error was thrown as a convenience so that if you enable
      // "break on all exceptions" in your console,
      // it would pause the execution at this line.
      throw new Error(message)
    } catch {
      // do nothing
    }

    return true
  }

  public static register(store: Impulse<unknown>): void {
    WatchContext.current?.register(store)
  }

  /**
   * The method allows to ignore the current WatchContext presence as if it is not there.
   * Helpful when something needs to perform Impulse#getState without subscribing it to the current WatchContext
   */
  public static ignore<T>(execute: () => T): T {
    const currentContext = WatchContext.current

    WatchContext.current = null

    const result = execute()

    WatchContext.current = currentContext

    return result
  }

  private readonly deadCleanups = new Set<Impulse<unknown>>()
  private readonly cleanups = new Map<Impulse<unknown>, VoidFunction>()

  private version = 0

  private notify: VoidFunction = noop

  public constructor(private readonly warningSource: null | WarningSource) {}

  private register(store: Impulse<unknown>): void {
    if (this.cleanups.has(store)) {
      // still alive
      this.deadCleanups.delete(store)
    } else {
      WatchContext.ignore(() => {
        this.cleanups.set(
          store,
          store.subscribe(() => {
            // the listener registers a watcher so the watcher will emit once per (batch) setState
            SetStateContext.registerWatchContext(this)
          }),
        )
      })
    }
  }

  private cleanupObsolete(): void {
    this.deadCleanups.forEach((impulse) => {
      const cleanup = this.cleanups.get(impulse)

      if (cleanup != null) {
        cleanup()
        this.cleanups.delete(impulse)
      }
    })

    this.deadCleanups.clear()
  }

  private cycle<T>(callback: () => T): T {
    const outerContext = WatchContext.current

    WatchContext.current = this

    // fill up dead cleanups with all of the current cleanups
    // to keep only real dead once during .register() call
    this.cleanups.forEach((_, impulse) => this.deadCleanups.add(impulse))

    const value = callback()

    this.cleanupObsolete()

    WatchContext.current = outerContext

    return value
  }

  private increment(): void {
    this.version = (this.version + 1) % 10e9
  }

  public subscribe(notify: VoidFunction): VoidFunction {
    this.notify = notify

    return () => {
      this.increment()
      this.cleanups.forEach((cleanup) => cleanup())
      this.cleanups.clear()
      this.deadCleanups.clear()
    }
  }

  public getVersion(): number {
    return this.version
  }

  public watchStores<T>(watcher: () => T): T {
    return this.cycle(watcher)
  }

  public emit(): void {
    this.increment()
    this.cycle(this.notify)
  }
}
