/**
 * A context to track Impulse#getValue usage inside the factory function.
 * The tracked calls will subscribe related stores to updates,
 * so the factory will execute on each update.
 *
 * @private
 */
export class ScopeEmitter {
  private static _queue: null | Array<ScopeEmitter> = null

  public static _init(emit: VoidFunction, shouldBatch = true): ScopeEmitter {
    return new ScopeEmitter(emit, shouldBatch)
  }

  public static _schedule<TResult>(
    execute: (
      enqueue: (emitters: ReadonlySet<WeakRef<ScopeEmitter>>) => void,
    ) => TResult,
  ): TResult {
    const queue = ScopeEmitter._queue

    if (queue) {
      return execute((emitters) => {
        for (const ref of emitters) {
          const emitter = ref.deref()

          if (emitter?._shouldBatch) {
            queue.push(emitter)
          } else if (emitter) {
            emitter._flush()
            emitter._emit()
          }
        }
      })
    }

    ScopeEmitter._queue = []

    const qq = ScopeEmitter._queue

    const result = execute((emitters) => {
      for (const ref of emitters) {
        const emitter = ref.deref()

        if (emitter?._shouldBatch) {
          qq.push(emitter)
        } else if (emitter) {
          emitter._flush()
          emitter._emit()
        }
      }
    })
    const executed = new WeakSet<ScopeEmitter>()

    for (const emitter of ScopeEmitter._queue) {
      if (!executed.has(emitter)) {
        executed.add(emitter)
        emitter._flush()
        emitter._emit()
      }
    }

    ScopeEmitter._queue = null

    return result
  }

  private readonly _cleanups: Array<VoidFunction> = []

  private readonly _ref = new WeakRef(this)

  private _version = 0

  private constructor(
    private readonly _emit: VoidFunction,
    private readonly _shouldBatch: boolean,
  ) {}

  public _detachEverywhere(): void {
    for (const cleanup of this._cleanups) {
      cleanup()
    }
    this._cleanups.length = 0
  }

  public _attachTo(emitters: Set<WeakRef<ScopeEmitter>>): void {
    if (!emitters.has(this._ref)) {
      emitters.add(this._ref)
      this._cleanups.push(() => emitters.delete(this._ref))
    }
  }

  public _flush(): void {
    this._version = (this._version + 1) % 10e9
    this._detachEverywhere()
  }

  public readonly _getVersion = (): number => {
    return this._version
  }
}
