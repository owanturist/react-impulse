import { noop } from "~/tools/noop"

import { enqueue } from "./enqueue"
import type { Scope } from "./scope"
import { ScopeEmitter } from "./scope-emitter"

/**
 * Factory responsible for creating and managing {@link Scope} instances through a shared
 * internal {@link ScopeEmitter}. Use {@link ScopeFactory.create} to obtain a constructor for
 * new scopes, and {@link ScopeFactory.connect} to subscribe an invalidation callback that
 * will be invoked when the factory requests an emission.
 */
class ScopeFactory {
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

export { ScopeFactory }
