import { EMITTER_KEY, type Scope } from "./scope"

class ScopeEmitQueue {
  private readonly _emitters = new Set<ScopeEmitter>()

  public _push(emitters: ReadonlySet<WeakRef<ScopeEmitter>>): void {
    /**
     * Calling the `_emit` might cause the same Impulse (host of the `emitters`)
     * to be scheduled again for the same scope (DerivedImpulse when source sets the comparably equal value).
     * It causes infinite loop, where the `emitter._invalidate()` first unsubscribes from the source Impulse but
     * the DerivedImpulse's `emitter._emit()` subscribes it back.
     *
     * To prevent this, the _push should only iterate over the emitters present at the moment of the call.
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
           * 2. CHANGED: marks as stale and _push's its._emitters so they end up here either emitting (DerivedImpulse) or scheduling (DirectImpulse).
           */
          emitter._emit()
        } else {
          // Schedule the emit when all the emitters are collected.
          this._emitters.add(emitter)
        }
      }
    }
  }

  public _process(): void {
    for (const emitter of this._emitters) {
      emitter._emit()
    }
  }
}

let QUEUE: null | ScopeEmitQueue = null

export function enqueue<TResult>(
  execute: (queue: ScopeEmitQueue) => TResult,
): TResult {
  // Continue the execution if the queue is already initialized.
  if (QUEUE) {
    return execute(QUEUE)
  }

  // Initialize the queue and start the execution sequence.
  const queue = (QUEUE = new ScopeEmitQueue())

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
  QUEUE = null

  queue._process()

  return result
}

/**
 * A context to track Impulse#getValue usage inside the factory function.
 * The tracked calls will subscribe related stores to updates,
 * so the factory will execute on each update.
 *
 * @private
 */
export class ScopeEmitter {
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
      enqueue(emit)
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
