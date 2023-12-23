import { noop } from "./utils"

/**
 * A context to track Impulse#getValue usage inside the factory function.
 * The tracked calls will subscribe related stores to updates,
 * so the factory will execute on each update.
 *
 * @private
 */
export class ScopeEmitter {
  public static _init(): ScopeEmitter {
    return new ScopeEmitter()
  }

  private static _queue: null | Array<ReadonlySet<ScopeEmitter>> = null

  public static _schedule<TResult>(
    execute: (queue: Array<ReadonlySet<ScopeEmitter>>) => TResult,
  ): TResult {
    if (ScopeEmitter._queue != null) {
      return execute(ScopeEmitter._queue)
    }

    const queue: Array<ReadonlySet<ScopeEmitter>> = []

    ScopeEmitter._queue = queue
    const result = execute(queue)
    ScopeEmitter._queue = null

    const uniq = new WeakSet<VoidFunction>()

    for (const emitters of queue) {
      for (const emitter of emitters) {
        if (!uniq.has(emitter._emit)) {
          uniq.add(emitter._emit)
          emitter._increment()
          emitter._detachAll()
          emitter._emit()
        }
      }
    }

    return result
  }

  private readonly _cleanups: Array<VoidFunction> = []

  private _version = 0

  private _emit: VoidFunction = noop

  private constructor() {}

  private _increment(): void {
    this._version = (this._version + 1) % 10e9
  }

  public _detachAll(): void {
    for (const cleanup of this._cleanups) {
      cleanup()
    }
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
