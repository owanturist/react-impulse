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
  private readonly cleanups = new Map<Impulse<unknown>, VoidFunction>()

  private version = 0

  private notify: null | VoidFunction = null

  private readonly emit = (): void => {
    this.cleanup()
    this.notify?.()
  }

  private cleanup(): void {
    this.version = (this.version + 1) % 10e9
    this.cleanups.forEach((cleanup) => cleanup())
    this.cleanups.clear()
  }

  public register(impulse: Impulse<unknown>): void {
    if (!this.cleanups.has(impulse)) {
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
    // in case if subscribe is called twice
    if (this.notify != null) {
      this.cleanup()
    }

    this.notify = notify

    return () => {
      this.cleanup()
    }
  }

  public getVersion(): number {
    return this.version
  }
}
