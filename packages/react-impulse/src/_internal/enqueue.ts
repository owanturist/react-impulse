import type { DerivedSignal } from "./derived-impulse"
import type { MonitorEmitter } from "./scope-emitter"

/**
 * Orchestrates invalidation and emission of {@link MonitorEmitter}s to prevent
 * re-subscription loops while ensuring {@link DerivedSignal}s observe the latest
 * state before downstream updates. Derived emitters are emitted immediately to
 * leverage their comparison logic, whereas direct emitters are batched and
 * flushed later via {@link MonitorEmitQueue._process}, avoiding redundant
 * scheduling while maintaining consistent propagation order.
 */
class MonitorEmitQueue {
  private readonly _emitters = new Set<MonitorEmitter>()

  /**
   * Adds the provided emitters to the queue for later processing.
   *
   * @remarks Invalidates each emitter immediately so that {@link DerivedSignal}s observe the latest version,
   * then triggers derived emitters synchronously to leverage their comparison logic, while
   * queueing non-derived emitters for deferred emission.
   *
   * @param emitters - The captured set of weak references to {@link MonitorEmitter}s awaiting processing.
   */
  public readonly _push = (emitters: ReadonlySet<WeakRef<MonitorEmitter>>): void => {
    /**
     * Calling the {@link MonitorEmitter._emit} might cause the same {@link Signal} (host of the {@link emitters})
     * to be scheduled again for the same monitor ({@link DerivedSignal} when source sets the comparably equal value).
     * It causes infinite loop, where the {@link MonitorEmitter._invalidate} first unsubscribes from the source {@link Signal} but
     * the {@link DerivedSignal}'s {@link MonitorEmitter._emit} subscribes it back.
     *
     * To prevent this, the _push should only iterate over the emitters present at the moment of the call.
     */
    for (const ref of Array.from(emitters)) {
      const emitter = ref.deref()

      if (emitter) {
        /**
         * Invalidate the emitter as soon as it is scheduled
         * so the {@link DerivedSignal}s can read a fresh value due to version increment.
         */
        emitter._invalidate()

        if (emitter._derived) {
          /**
           * Emit immediately so {@link DerivedSignal}s utilize the equals function to either:
           * 1. NOT CHANGED: resubscribe to sources
           * 2. CHANGED: marks as stale and _push's its._emitters so they end up here either emitting ({@link DerivedSignal}) or scheduling ({@link Signal}).
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

let Queue: null | MonitorEmitQueue = null

/**
 * Runs a queue-backed execution block, ensuring that nested enqueue calls share
 * the same monitor emit queue and that queued emitters are processed exactly once.
 *
 * @template TResult - The value returned by the execution block.
 * @param execute - Callback invoked with the active monitor emit queue.
 *
 * @returns The value produced by the provided execution block.
 */
function enqueue<TResult>(
  execute: (push: (emitters: ReadonlySet<WeakRef<MonitorEmitter>>) => void) => TResult,
): TResult {
  // Continue the execution if the queue is already initialized.
  if (Queue) {
    return execute(Queue._push)
  }

  // Initialize the queue and start the execution sequence.
  Queue = new MonitorEmitQueue()

  /**
   * The execution might lead to other {@link enqueue} calls,
   * so they all will collect the emitters in the same queue
   * ensuring that an emitter is emitted only once.
   */
  const result = execute(Queue._push)

  const tmp = Queue

  /**
   * Drop the global queue before processing to allow nested scheduling,
   * when {@link MonitorEmitter._emit} enqueues new emitters for the next tick.
   */
  Queue = null

  tmp._process()

  return result
}

export { enqueue }
