import type { Signal } from "../impulse"

import type { DerivedSignal } from "./derived-impulse"
import { type Monitor, createMonitor } from "./scope"

/**
 * Manages the lifecycle of monitor emitters, providing creation, attachment, and invalidation
 * mechanisms for reactivity tracking within the {@link Signal} system.
 *
 * @remarks
 * Each instance maintains weak references to all emitters it is attached to, ensuring proper
 * teardown when monitors are recreated or invalidated to avoid leaking subscriptions.
 */
class MonitorEmitter {
  /**
   * Maintains the collections of monitor emitters this instance has been attached to, using nested
   * sets of weak references so that attachments can be tracked without preventing garbage collection.
   */
  private readonly _attachedTo = new Set<Set<WeakRef<MonitorEmitter>>>()

  /**
   * Maintains a weak reference to the current monitor emitter instance, allowing listeners to access it without preventing garbage collection.
   */
  private readonly _ref = new WeakRef(this)

  /**
   * Initializes and returns a new instance of the {@link MonitorEmitter} class.
   *
   * @param _emit - Callback invoked via the internal queue whenever the {@link Monitor} needs to broadcast an update.
   * @param _derived - Indicates whether the emitter originates from a {@link DerivedSignal}, deferring subscription until first access.
   */
  public constructor(
    public readonly _emit: VoidFunction,
    public readonly _derived: boolean,
  ) {}

  /**
   * Detaches the current {@link Monitor} reference from every emitter it is attached to
   * and clears the internal tracking set to prevent stale subscriptions.
   */
  private _detachFromAll(): void {
    for (const emitters of this._attachedTo) {
      emitters.delete(this._ref)
    }

    this._attachedTo.clear()
  }

  /**
   * Resets the current {@link Monitor} by detaching from all tracked emitters and returning a fresh {@link Monitor} instance bound to this emitter.
   *
   * @remarks
   * A {@link Monitor} is always created on a new reading cycle, so all previous subscriptions must be cleared.
   *
   * @returns The newly created {@link Monitor} that references this emitter.
   */
  private _renew(): Monitor {
    this._detachFromAll()

    return createMonitor(this)
  }

  /**
   * Registers this monitor emitter with the provided collection of emitters,
   * ensuring the weak reference is tracked for future coordination or cleanup.
   *
   * @param emitters - Set of weak references to monitor emitters that this instance should join.
   */
  public _attachTo(emitters: Set<WeakRef<MonitorEmitter>>): void {
    emitters.add(this._ref)
    this._attachedTo.add(emitters)
  }

  /**
   * Creates a new {@link Monitor} associated with this emitter after clearing any existing attachments.
   *
   * @returns A fresh {@link Monitor} instance.
   */
  public _create = (): Monitor => this._renew()

  /**
   * Resets the emitter state to ensure it detaches from all current dependencies and reinitializes its factory.
   */
  public _invalidate(): void {
    this._create = () => this._renew()

    this._detachFromAll()
  }
}

export { MonitorEmitter }
