import type { Impulse } from "./Impulse"
import { SetValueContext } from "./SetValueContext"

/**
 * A context to track Impulse#getValue usage inside the watcher function.
 * The tracked calls will subscribe related stores to updates,
 * so the watcher will execute on each update.
 *
 * @private
 */
export class WatchContext {
  private readonly deadCleanups = new Set<Impulse<unknown>>()
  private readonly cleanups = new Map<Impulse<unknown>, VoidFunction>()

  private version = 0

  private notify: null | VoidFunction = null

  private readonly emit = (): void => {
    this.increment()
    if (this.notify != null) {
      this.cycle(this.notify)
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
    // fill up dead cleanups with all of the current cleanups
    // to keep only real dead once during .register() call
    this.cleanups.forEach((_, impulse) => this.deadCleanups.add(impulse))

    const value = callback()

    this.cleanupObsolete()

    return value
  }

  private increment(): void {
    this.version = (this.version + 1) % 10e9
  }

  public register(impulse: Impulse<unknown>): void {
    if (this.cleanups.has(impulse)) {
      // still alive
      this.deadCleanups.delete(impulse)
    } else {
      this.cleanups.set(
        impulse,
        impulse.subscribe(() => {
          // the listener registers a watcher so the watcher will emit once per (batch) setValue
          SetValueContext.registerEmitter(this.emit)
        }),
      )
    }
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
