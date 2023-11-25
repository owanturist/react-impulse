import { noop } from "./utils"

/**
 * A context to track Impulse#getValue usage inside the watcher function.
 * The tracked calls will subscribe related stores to updates,
 * so the watcher will execute on each update.
 *
 * @private
 */
export class ScopeEmitter {
  private static _queue: null | Array<null | ReadonlySet<ScopeEmitter>> = null

  public static _schedule(
    execute: () => null | ReadonlySet<ScopeEmitter>,
  ): void {
    if (ScopeEmitter._queue == null) {
      ScopeEmitter._queue = []

      ScopeEmitter._queue.push(execute())

      const uniq = new WeakSet<VoidFunction>()

      ScopeEmitter._queue.forEach((emitters) => {
        emitters?.forEach((emitter) => {
          if (!uniq.has(emitter._emit)) {
            uniq.add(emitter._emit)
            emitter._increment()
            emitter._detachAll()
            emitter._emit()
          }
        })
      })

      ScopeEmitter._queue = null
    } else {
      ScopeEmitter._queue.push(execute())
    }
  }

  private readonly _cleanups: Array<VoidFunction> = []

  private _version = 0

  private _emit: VoidFunction = noop

  private _increment(): void {
    this._version = (this._version + 1) % 10e9
  }

  public _detachAll(): void {
    this._cleanups.forEach((cleanup) => cleanup())
    this._cleanups.length = 0
  }

  public _attachTo(emitters: Set<ScopeEmitter>): void {
    if (!emitters.has(this)) {
      emitters.add(this)
      this._cleanups.push(() => emitters.delete(this))
    }
  }

  public _onEmit = (emit: VoidFunction): VoidFunction => {
    this._emit = emit

    return () => {
      this._increment()
      this._detachAll()
      this._emit = noop
    }
  }

  public _getVersion = (): number => {
    return this._version
  }
}
