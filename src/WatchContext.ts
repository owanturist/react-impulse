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
    this.cleanupAndBump()
    this.notify?.()
  }

  private cleanupAndBump(): void {
    this.version = (this.version + 1) % 10e9
    this.cleanup()
  }

  public cleanup(): void {
    this.cleanups.forEach((cleanup) => cleanup())
    this.cleanups.clear()
  }

  public register(impulse: Impulse<unknown>): void {
    if (!this.cleanups.has(impulse)) {
      this.cleanups.set(
        impulse,
        // the listener registers a watcher so the watcher will emit once per (batch) setValue
        impulse.subscribe(() => SetValueContext.registerEmitter(this.emit)),
      )
    }
  }

  public subscribe(notify: VoidFunction): VoidFunction {
    // in case if subscribe is called twice
    if (this.notify != null) {
      this.cleanupAndBump()
    }

    this.notify = notify

    return () => {
      this.cleanupAndBump()
      this.notify = null
    }
  }

  public getVersion(): number {
    return this.version
  }
}
