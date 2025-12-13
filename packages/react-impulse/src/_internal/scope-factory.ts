import { noop } from "~/tools/noop"

import { enqueue } from "./enqueue"
import type { Monitor } from "./scope"
import { MonitorEmitter } from "./scope-emitter"

/**
 * Factory responsible for creating and managing {@link Monitor} instances through a shared
 * internal {@link MonitorEmitter}. Use {@link MonitorFactory.create} to obtain a constructor for
 * new monitors, and {@link MonitorFactory.connect} to subscribe an invalidation callback that
 * will be invoked when the factory requests an emission.
 */
class MonitorFactory {
  private _emit = noop

  private readonly _emitter = new MonitorEmitter(() => {
    enqueue(this._emit)
  }, false)

  /**
   * Registers an emission callback for the monitor emitter and returns a disposer.
   *
   * @param emit - Callback to invoke when the monitor emits changes.
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
   * Retrieves the factory function used to instantiate new {@link Monitor} objects.
   *
   * @returns A function that creates and returns a fresh {@link Monitor}.
   */
  public get create(): () => Monitor {
    return this._emitter._create
  }
}

export { MonitorFactory }
