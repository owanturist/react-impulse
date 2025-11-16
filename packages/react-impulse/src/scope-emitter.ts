import { noop } from "~/tools/noop"

import { EMITTER_KEY, type Scope } from "./scope"

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
  public _push(emitters: ReadonlySet<WeakRef<ScopeEmitter>>): void {
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

let QUEUE: null | ScopeEmitQueue = null

/**
 * Runs a queue-backed execution block, ensuring that nested enqueue calls share
 * the same scope emit queue and that queued emitters are processed exactly once.
 *
 * @template TResult - The value returned by the execution block.
 * @param execute - Callback invoked with the active scope emit queue.
 *
 * @returns The value produced by the provided execution block.
 */
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
   * The execution might lead to other {@link enqueue} calls,
   * so they all will collect the emitters in the same queue
   * ensuring that an emitter is emitted only once.
   */
  const result = execute(queue)

  /**
   * Drop the global queue before processing to allow nested scheduling,
   * when {@link ScopeEmitter._emit} enqueues new emitters for the next tick.
   */
  QUEUE = null

  queue._process()

  return result
}

/**
 * Manages the lifecycle of scope emitters, providing creation, attachment, and invalidation
 * mechanisms for scoped reactivity tracking within the impulse system.
 *
 * @remarks
 * Each instance maintains weak references to all emitters it is attached to, ensuring proper
 * teardown when scopes are recreated or invalidated to avoid leaking subscriptions.
 */
export class ScopeEmitter {
  /**
   * Maintains the collections of scope emitters this instance has been attached to, using nested
   * sets of weak references so that attachments can be tracked without preventing garbage collection.
   */
  private readonly _attachedTo = new Set<Set<WeakRef<ScopeEmitter>>>()

  /**
   * Maintains a weak reference to the current scope emitter instance, allowing listeners to access it without preventing garbage collection.
   */
  private readonly _ref = new WeakRef(this)

  /**
   * Initializes and returns a new instance of the `ScopeEmitter` class.
   *
   * @param _emit - Callback invoked via the internal queue whenever the scope needs to broadcast an update.
   * @param _derived - Indicates whether the emitter originates from a derived impulse, deferring subscription until first access.
   */
  public constructor(
    public readonly _emit: VoidFunction,
    public readonly _derived: boolean,
  ) {}

  /**
   * Detaches the current scope reference from every emitter it is attached to
   * and clears the internal tracking set to prevent stale subscriptions.
   */
  private _detachFromAll(): void {
    for (const emitters of this._attachedTo) {
      emitters.delete(this._ref)
    }

    this._attachedTo.clear()
  }

  /**
   * Resets the current scope by detaching from all tracked emitters and returning
   * a fresh scope instance bound to this emitter.
   *
   * @remarks
   * A {@link Scope} is always created on a new reading cycle, so all previous subscriptions must be cleared.
   *
   * @returns The newly created scope that references this emitter via {@link EMITTER_KEY}.
   */
  private _renew(): Scope {
    this._detachFromAll()

    return {
      [EMITTER_KEY]: this,
    }
  }

  /**
   * Registers this scope emitter with the provided collection of emitters,
   * ensuring the weak reference is tracked for future coordination or cleanup.
   *
   * @param emitters - Set of weak references to scope emitters that this instance should join.
   */
  public _attachTo(emitters: Set<WeakRef<ScopeEmitter>>): void {
    emitters.add(this._ref)
    this._attachedTo.add(emitters)
  }

  /**
   * Creates a new scope associated with this emitter after clearing any existing attachments.
   *
   * @returns A fresh scope instance.
   */
  public _create = (): Scope => this._renew()

  /**
   * Resets the emitter state to ensure it detaches from all current dependencies and reinitializes its factory.
   */
  public _invalidate(): void {
    this._create = () => this._renew()

    this._detachFromAll()
  }
}

/**
 * Factory responsible for creating and managing {@link Scope} instances through a shared
 * internal {@link ScopeEmitter}. Use {@link ScopeFactory.create} to obtain a constructor for
 * new scopes, and {@link ScopeFactory.connect} to subscribe an invalidation callback that
 * will be invoked when the factory requests an emission.
 */
export class ScopeFactory {
  private _emit = noop

  private readonly _emitter = new ScopeEmitter(() => {
    enqueue(this._emit)
  }, false)

  /**
   * Registers an emission callback for the scope emitter and returns a disposer.
   *
   * @param emit - Callback to invoke when the scope emits changes.
   *
   * @returns A cleanup function that invalidates the underlying emitter when invoked.
   */
  public connect(emit: VoidFunction): VoidFunction {
    this._emit = emit

    return () => {
      this._emit = noop
      this._emitter._invalidate()
    }
  }

  /**
   * Retrieves the factory function used to instantiate new {@link Scope} objects.
   *
   * @returns A function that creates and returns a fresh {@link Scope}.
   */
  public get create(): () => Scope {
    return this._emitter._create
  }
}
