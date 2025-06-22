export class ScopeEmitterQueue {
  private readonly _queue = new Set<ScopeEmitter>()

  public _push(emitters: ReadonlySet<WeakRef<ScopeEmitter>>): void {
    for (const ref of emitters) {
      const emitter = ref.deref()

      if (emitter) {
        this._queue.add(emitter)
        // flush the emitter as soon as it is scheduled
        // so the derived impulses can read a fresh value due to version increment
        emitter._flush()
      }
    }
  }

  public [Symbol.iterator](): IterableIterator<ScopeEmitter> {
    return this._queue[Symbol.iterator]()
  }
}

/**
 * A context to track Impulse#getValue usage inside the factory function.
 * The tracked calls will subscribe related stores to updates,
 * so the factory will execute on each update.
 *
 * @private
 */
export class ScopeEmitter {
  private static _queue: null | ScopeEmitterQueue = null

  public static _init(emit: VoidFunction): ScopeEmitter {
    return new ScopeEmitter(emit)
  }

  public static _schedule<TResult>(
    execute: (queue: ScopeEmitterQueue) => TResult,
  ): TResult {
    // continue the execution if the queue is already initialized
    if (ScopeEmitter._queue) {
      return execute(ScopeEmitter._queue)
    }

    // initialize the queue and start the execution sequence
    ScopeEmitter._queue = new ScopeEmitterQueue()

    // the execution might lead to other `_schedule` calls,
    // so they all will collect the emitters in the same queue
    // ensuring that an emitter is emitted only once
    const result = execute(ScopeEmitter._queue)

    for (const emitter of ScopeEmitter._queue) {
      emitter._emit()
    }

    ScopeEmitter._queue = null

    return result
  }

  private readonly _attachedTo = new Set<Set<WeakRef<ScopeEmitter>>>()

  private readonly _ref = new WeakRef(this)

  private _version = 0

  private constructor(private readonly _emit: VoidFunction) {}

  public _detachFromAll(): void {
    for (const emitters of this._attachedTo) {
      emitters.delete(this._ref)
    }

    this._attachedTo.clear()
  }

  public _attachTo(emitters: Set<WeakRef<ScopeEmitter>>): void {
    emitters.add(this._ref)
    this._attachedTo.add(emitters)
  }

  public _flush(): void {
    this._version = (this._version + 1) % 10e9
    this._detachFromAll()
  }

  public readonly _getVersion = (): number => {
    return this._version
  }
}
