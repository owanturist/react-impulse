import { EMITTER_KEY, type Scope } from "./scope"

/**
 * Manages the lifecycle of scope emitters, providing creation, attachment, and invalidation
 * mechanisms for scoped reactivity tracking within the impulse system.
 *
 * @remarks
 * Each instance maintains weak references to all emitters it is attached to, ensuring proper
 * teardown when scopes are recreated or invalidated to avoid leaking subscriptions.
 */
class ScopeEmitter {
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

export { ScopeEmitter }
