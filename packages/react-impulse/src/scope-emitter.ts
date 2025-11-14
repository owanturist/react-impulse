import { EMITTER_KEY, type Scope } from "./scope"

export class ScopeEmitQueue {
  private readonly _queue = new Set<ScopeEmitter>()

  public _enqueue(emitters: ReadonlySet<WeakRef<ScopeEmitter>>): void {
    /**
     * Calling the `_emit` might cause the same Impulse (host of the `emitters`)
     * to be scheduled again for the same scope (DerivedImpulse when source sets the comparably equal value).
     * It causes infinite loop, where the `emitter._invalidate()` first unsubscribes from the source Impulse but
     * the DerivedImpulse's `emitter._emit()` subscribes it back.
     *
     * To prevent this, the _enqueue should only iterate over the emitters present at the moment of the call.
     */
    for (const ref of Array.from(emitters)) {
      const emitter = ref.deref()

      if (emitter) {
        /**
         * Invalidate the emitter as soon as it is scheduled
         * so the derived impulses can read a fresh value due to version increment.
         */
        emitter._invalidate()

        if (emitter._derived) {
          /**
           * Emit immediately so `DerivedImpulse` utilizes the compare function to either:
           * 1. NOT CHANGED: resubscribe to sources
           * 2. CHANGED: marks as stale and _enqueue's its._emitters so they end up here either emitting (DerivedImpulse) or scheduling (DirectImpulse).
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
  private static _queue: null | ScopeEmitQueue = null

  public static _schedule<TResult>(
    execute: (queue: ScopeEmitQueue) => TResult,
  ): TResult {
    // Continue the execution if the queue is already initialized.
    if (ScopeEmitter._queue) {
      return execute(ScopeEmitter._queue)
    }

    const queue = new ScopeEmitQueue()

    // Initialize the queue and start the execution sequence.
    ScopeEmitter._queue = queue

    /**
     * The execution might lead to other `_schedule` calls,
     * so they all will collect the emitters in the same queue
     * ensuring that an emitter is emitted only once.
     */
    const result = execute(queue)

    /**
     * Drop the global queue before processing to allow nested scheduling,
     * when .emit() enqueues new emitters for the next tick.
     */
    ScopeEmitter._queue = null

    queue._process()

    return result
  }

  private readonly _attachedTo = new Set<Set<WeakRef<ScopeEmitter>>>()

  private readonly _ref = new WeakRef(this)

  public readonly _emit: VoidFunction

  public _factory = (): Scope => {
    this._detachFromAll()

    return {
      [EMITTER_KEY]: this,
    }
  }

  /**
   * Initializes and returns a new instance of the `ScopeEmitter` class.
   *
   * @param emit - A callback function to be invoked when the scope emits.
   * @param _derived - Indicates whether the emission should be derived.
   *                   Used in `DerivedImpulse` so that it subscribes only after the first value read.
   */
  public constructor(
    emit: (queue: ScopeEmitQueue) => void,
    public readonly _derived = false,
  ) {
    this._emit = () => {
      ScopeEmitter._schedule(emit)
    }
  }

  private _detachFromAll(): void {
    for (const emitters of this._attachedTo) {
      emitters.delete(this._ref)
    }

    this._attachedTo.clear()
  }

  public _attachTo(emitters: Set<WeakRef<ScopeEmitter>>): void {
    emitters.add(this._ref)
    this._attachedTo.add(emitters)
  }

  public _invalidate(): void {
    this._factory = () => {
      this._detachFromAll()

      return {
        [EMITTER_KEY]: this,
      }
    }

    this._detachFromAll()
  }
}
