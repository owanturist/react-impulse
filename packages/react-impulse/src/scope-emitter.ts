export class ScopeEmitterQueue {
  private readonly _queue = new Set<ScopeEmitter>()

  public _push(emitters: ReadonlySet<WeakRef<ScopeEmitter>>): void {
    /**
     * Calling the `_emit` might cause the same Impulse (host of the `emitters`)
     * to be scheduled again for the same scope (DerivedImpulse when source sets the comparably equal value).
     * It causes infinite loop, where the `emitter._flush()` first unsubscribes from the source Impulse but
     * the DerivedImpulse's `emitter._emit()` subscribes it back.
     *
     * To prevent this, the _push should only iterate over the emitters present at the moment of the call.
     */
    for (const ref of Array.from(emitters)) {
      const emitter = ref.deref()

      if (emitter) {
        /**
         * Flush the emitter as soon as it is scheduled
         * so the derived impulses can read a fresh value due to version increment.
         */
        emitter._flush()

        if (emitter._skipBatching) {
          /**
           * Emit immediately so `DerivedImpulse` utilizes the compare function to either:
           * 1. NOT CHANGED: resubscribe to sources and set its._version = emitter._version
           * 2. CHANGED: _push'es its._emitters so they end up here either emitting (DerivedImpulse) or scheduling (DirectImpulse).
           */
          emitter._emit()
        } else {
          // Schedule the emit when all the emitters are collected.
          this._queue.add(emitter)
        }
      }
    }
  }

  public _process(): void {
    for (const emitter of this._queue) {
      emitter._emit()
    }
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

  public static _schedule<TResult>(
    execute: (queue: ScopeEmitterQueue) => TResult,
  ): TResult {
    // Continue the execution if the queue is already initialized.
    if (ScopeEmitter._queue) {
      return execute(ScopeEmitter._queue)
    }

    // Initialize the queue and start the execution sequence.
    ScopeEmitter._queue = new ScopeEmitterQueue()

    /**
     * The execution might lead to other `_schedule` calls,
     * so they all will collect the emitters in the same queue
     * ensuring that an emitter is emitted only once.
     */
    const result = execute(ScopeEmitter._queue)

    ScopeEmitter._queue._process()
    ScopeEmitter._queue = null

    return result
  }

  private readonly _attachedTo = new Set<Set<WeakRef<ScopeEmitter>>>()

  private readonly _ref = new WeakRef(this)

  private _version = 0

  /**
   * Initializes and returns a new instance of the `ScopeEmitter` class.
   *
   * @param emit - A callback function to be invoked when the scope emits.
   * @param skipBatching - opt-out from emit batching. Necessary for derived impulses.
   */
  public constructor(
    public readonly _emit: VoidFunction,
    public readonly _skipBatching = false,
  ) {}

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
