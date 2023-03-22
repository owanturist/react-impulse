import type { Impulse } from "./Impulse"
import { SetValueContext } from "./SetValueContext"
import { isFunction } from "./utils"
import { WarningSet, WarningSource } from "./validation"

/**
 * A context to track Impulse#getValue usage inside the watcher function.
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

  public static register(impulse: Impulse<unknown>): void {
    WatchContext.current?.register(impulse)
  }

  /**
   * The method allows to ignore the current WatchContext presence as if it is not there.
   * Helpful when something needs to perform Impulse#getValue without subscribing it to the current WatchContext
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

  private notify: null | VoidFunction = null

  public constructor(private readonly warningSource: null | WarningSource) {}

  private readonly emit = (): void => {
    this.increment()
    if (this.notify != null) {
      this.cycle(this.notify)
    }
  }

  private register(impulse: Impulse<unknown>): void {
    if (this.cleanups.has(impulse)) {
      // still alive
      this.deadCleanups.delete(impulse)
    } else {
      WatchContext.ignore(() => {
        this.cleanups.set(
          impulse,
          impulse.subscribe(() => {
            // the listener registers a watcher so the watcher will emit once per (batch) setValue
            SetValueContext.registerEmitter(this.emit)
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

    // happens when rendering in StrictMode so a WatchContext can execute itself
    WatchContext.current = outerContext === this ? null : outerContext

    return value
  }

  private increment(): void {
    this.version = (this.version + 1) % 10e9
  }

  public subscribe(notify: VoidFunction): VoidFunction {
    const unsubscribe = (): void => {
      // does not need to unsubscribe if it is already unsubscribed
      if (this.notify == null) {
        return
      }

      this.notify = null
      this.increment()
      this.cleanups.forEach((cleanup) => cleanup())
      this.cleanups.clear()
      this.deadCleanups.clear()
    }

    // in case if subscribe is called twice
    unsubscribe()
    this.notify = notify

    return unsubscribe
  }

  public getVersion(): number {
    return this.version
  }

  public watchStores<T>(watcher: () => T): T {
    return this.cycle(watcher)
  }
}
