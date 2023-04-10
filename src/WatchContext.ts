import { SetValueContext } from "./SetValueContext"

/**
 * A context to track Impulse#getValue usage inside the watcher function.
 * The tracked calls will subscribe related stores to updates,
 * so the watcher will execute on each update.
 *
 * @private
 */
export class WatchContext {
  private readonly cleanups = new Set<React.Dispatch<VoidFunction>>()

  private version = 0

  private notify: null | VoidFunction = null

  private readonly emit = (): void => {
    SetValueContext.registerEmitter(() => {
      this.reset()
      this.notify?.()
    })
  }

  private reset(): void {
    this.version = (this.version + 1) % 10e9
    this.cleanup()
  }

  public cleanup(): void {
    this.cleanups.forEach((cleanup) => cleanup(this.emit))
    this.cleanups.clear()
  }

  public register(
    subscribe: React.Dispatch<VoidFunction>,
    unsubscribe: React.Dispatch<VoidFunction>,
  ): void {
    if (!this.cleanups.has(unsubscribe)) {
      subscribe(this.emit)
      this.cleanups.add(unsubscribe)
    }
  }

  public subscribe = (notify: VoidFunction): VoidFunction => {
    // in case if subscribe is called twice
    if (this.notify != null) {
      this.reset()
    }

    this.notify = notify

    return () => {
      this.reset()
      this.notify = null
    }
  }

  public getVersion = (): number => {
    return this.version
  }
}
