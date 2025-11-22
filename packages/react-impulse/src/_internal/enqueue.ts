import type { ScopeEmitter } from "./scope-emitter"

/**
 * Orchestrates invalidation and emission of scope emitters to prevent
 * re-subscription loops while ensuring derived impulses observe the latest
 * state before downstream updates. Derived emitters are emitted immediately to
 * leverage their comparison logic, whereas direct emitters are batched and
 * flushed later via {@link ScopeEmitQueue._process}, avoiding redundant
 * scheduling while maintaining consistent propagation order.
 */
class ScopeEmitQueue {
  private readonly _emitters = new Set<ScopeEmitter>()

  /**
   * Adds the provided emitters to the queue for later processing.
   *
   * @remarks Invalidates each emitter immediately so that derived impulses observe the latest version,
   * then triggers derived emitters synchronously to leverage their comparison logic, while
   * queueing non-derived emitters for deferred emission.
   *
   * @param emitters - The captured set of weak references to scope emitters awaiting processing.
   */
  public readonly _push = (emitters: ReadonlySet<WeakRef<ScopeEmitter>>): void => {
    /**
     * Calling the {@link ScopeEmitter._emit} might cause the same Impulse (host of the `emitters`)
     * to be scheduled again for the same scope (DerivedImpulse when source sets the comparably equal value).
     * It causes infinite loop, where the {@link ScopeEmitter._invalidate} first unsubscribes from the source Impulse but
     * the DerivedImpulse's {@link ScopeEmitter._emit} subscribes it back.
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

  /**
   * Iterates through all registered emitters and triggers their emission cycle.
   */
  public _process(): void {
    for (const emitter of this._emitters) {
      emitter._emit()
    }
  }
}
let Queue: null | ScopeEmitQueue = null
/**
 * Runs a queue-backed execution block, ensuring that nested enqueue calls share
 * the same scope emit queue and that queued emitters are processed exactly once.
 *
 * @template TResult - The value returned by the execution block.
 * @param execute - Callback invoked with the active scope emit queue.
 *
 * @returns The value produced by the provided execution block.
 */

function enqueue<TResult>(
  execute: (push: (emitters: ReadonlySet<WeakRef<ScopeEmitter>>) => void) => TResult,
): TResult {
  // Continue the execution if the queue is already initialized.
  if (Queue) {
    return execute(Queue._push)
  }

  // Initialize the queue and start the execution sequence.
  Queue = new ScopeEmitQueue()

  /**
   * The execution might lead to other {@link enqueue} calls,
   * so they all will collect the emitters in the same queue
   * ensuring that an emitter is emitted only once.
   */
  const result = execute(Queue._push)

  const tmp = Queue

  /**
   * Drop the global queue before processing to allow nested scheduling,
   * when {@link ScopeEmitter._emit} enqueues new emitters for the next tick.
   */
  Queue = null

  tmp._process()

  return result
}

export { enqueue }
