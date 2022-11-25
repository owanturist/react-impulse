import type { Sweety } from "./Sweety"
import { SetStateContext } from "./SetStateContext"
import { noop } from "./utils"
import { WarningSet, WarningSource } from "./validation"

/**
 * A context to track Sweety#getState() usage inside the watcher function.
 * The tracked calls will subscribe related stores to updates,
 * so the watcher will execute on each update.
 *
 * @private
 */
export class WatchContext {
  public static current: null | WatchContext = null

  public static warning(warningSet: WarningSet): boolean {
    const warningSource = WatchContext.current?.warningSource
    const message = warningSource == null ? null : warningSet[warningSource]

    if (message == null) {
      return false
    }

    if (
      typeof console !== "undefined" &&
      // eslint-disable-next-line no-console
      typeof console.error === "function"
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

  public static register<T>(store: Sweety<T>): void {
    WatchContext.current?.register(store)
  }

  private readonly deadCleanups = new Set<string>()
  private readonly cleanups = new Map<string, VoidFunction>()

  private version = 0

  private notify: VoidFunction = noop

  public constructor(private warningSource: null | WarningSource) {}

  private register<T>(store: Sweety<T>): void {
    if (this.cleanups.has(store.key)) {
      // still alive
      this.deadCleanups.delete(store.key)
    } else {
      const isContextReadonly = this.warningSource

      this.warningSource = null
      this.cleanups.set(
        store.key,
        store.subscribe(() => {
          // the listener registers a watcher so the watcher will emit once per (batch) setState
          SetStateContext.registerWatchContext(this)
        }),
      )
      this.warningSource = isContextReadonly
    }
  }

  private cleanupObsolete(): void {
    this.deadCleanups.forEach((key) => {
      const cleanup = this.cleanups.get(key)

      if (cleanup != null) {
        cleanup()
        this.cleanups.delete(key)
      }
    })

    this.deadCleanups.clear()
  }

  private cycle<T>(callback: () => T): T {
    const previousContext = WatchContext.current

    WatchContext.current = this

    // fill up dead cleanups with all of the current cleanups
    // to keep only real dead once during .register() call
    this.cleanups.forEach((_, key) => this.deadCleanups.add(key))

    const value = callback()

    this.cleanupObsolete()

    WatchContext.current = previousContext

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
