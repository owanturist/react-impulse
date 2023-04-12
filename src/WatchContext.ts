import type { Emitter } from "./scheduler"

/**
 * A context to track Impulse#getValue usage inside the watcher function.
 * The tracked calls will subscribe related stores to updates,
 * so the watcher will execute on each update.
 *
 * @private
 */
// TODO rename to something more meaningful (ScopeEmitter?)
export class WatchContext implements Emitter {
  private readonly cleanups: Array<VoidFunction> = []

  private version = 0

  private tick: null | VoidFunction = null

  private reset(): void {
    this.version = (this.version + 1) % 10e9
    this.clean()
  }

  public emit(): void {
    this.reset()
    this.tick?.()
  }

  public clean(): void {
    this.cleanups.forEach((cleanup) => cleanup())
    this.cleanups.length = 0
  }

  public register(cleanup: VoidFunction): void {
    this.cleanups.push(cleanup)
  }

  public subscribe = (tick: VoidFunction): VoidFunction => {
    // in case if subscribe is called twice
    if (this.tick != null) {
      this.reset()
    }

    this.tick = tick

    return () => {
      this.reset()
      this.tick = null
    }
  }

  public getVersion = (): number => {
    return this.version
  }
}
