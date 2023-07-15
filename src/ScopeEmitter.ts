import { noop } from "./utils"

/**
 * A context to track Impulse#getValue usage inside the watcher function.
 * The tracked calls will subscribe related stores to updates,
 * so the watcher will execute on each update.
 *
 * @private
 */
export class ScopeEmitter {
  private static queue: null | Array<null | ReadonlySet<ScopeEmitter>> = null

  public static schedule(
    execute: () => null | ReadonlySet<ScopeEmitter>,
  ): void {
    if (ScopeEmitter.queue == null) {
      ScopeEmitter.queue = []

      ScopeEmitter.queue.push(execute())

      const uniq = new WeakSet<VoidFunction>()

      ScopeEmitter.queue.forEach((emitters) => {
        emitters?.forEach((emitter) => {
          if (!uniq.has(emitter.emit)) {
            uniq.add(emitter.emit)
            emitter.increment()

            if (emitter.shouldDetachOnEmit) {
              emitter.detachAll()
            }

            emitter.emit()
          }
        })
      })

      ScopeEmitter.queue = null
    } else {
      ScopeEmitter.queue.push(execute())
    }
  }

  // TODO remove shouldDetachOnEmit when Impulse#subscribe is gone
  public constructor(private readonly shouldDetachOnEmit: boolean = true) {}

  private readonly cleanups: Array<VoidFunction> = []

  private version = 0

  private emit: VoidFunction = noop

  private increment(): void {
    this.version = (this.version + 1) % 10e9
  }

  public detachAll(): void {
    this.cleanups.forEach((cleanup) => cleanup())
    this.cleanups.length = 0
  }

  public attachTo(emitters: Set<ScopeEmitter>): void {
    if (!emitters.has(this)) {
      emitters.add(this)
      this.cleanups.push(() => emitters.delete(this))
    }
  }

  public onEmit = (emit: VoidFunction): VoidFunction => {
    this.emit = emit

    return () => {
      this.increment()
      this.detachAll()
      this.emit = noop
    }
  }

  public getVersion = (): number => {
    return this.version
  }
}
