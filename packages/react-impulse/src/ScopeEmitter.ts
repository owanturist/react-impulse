/**
 * A context to track Impulse#getValue usage inside the factory function.
 * The tracked calls will subscribe related stores to updates,
 * so the factory will execute on each update.
 *
 * @private
 */
export class ScopeEmitter {
  public static _init(emit: VoidFunction): ScopeEmitter {
    return new ScopeEmitter(emit)
  }

  private static _queue: null | Array<ReadonlySet<ScopeEmitter>> = null

  public static _schedule<TResult>(
    execute: (queue: Array<ReadonlySet<ScopeEmitter>>) => TResult,
  ): TResult {
    if (ScopeEmitter._queue != null) {
      return execute(ScopeEmitter._queue)
    }

    ScopeEmitter._queue = []

    const result = execute(ScopeEmitter._queue)
    const executed = new WeakSet<ScopeEmitter>()

    for (const emitters of ScopeEmitter._queue) {
      for (const emitter of emitters) {
        if (!executed.has(emitter)) {
          executed.add(emitter)
          emitter._flush()
          emitter._emit()
        }
      }
    }

    ScopeEmitter._queue = null

    return result
  }

  private readonly _cleanups: Array<VoidFunction> = []

  private _version = 0

  private constructor(private readonly _emit: VoidFunction) {}

  public _cleanup(): void {
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

  public _flush(): void {
    this._version = (this._version + 1) % 10e9
    this._cleanup()
  }

  public readonly _getVersion = (): number => {
    return this._version
  }
}
