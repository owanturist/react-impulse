import type { Equal } from "../compare"

import { BaseSignal } from "./base-impulse"
import { enqueue } from "./enqueue"
import { Signal } from "./impulse"
import { type Monitor, UNTRACKED_MONITOR, injectMonitor } from "./scope"
import { MonitorEmitter } from "./scope-emitter"

class DerivedSignal<T> extends BaseSignal<T> {
  // the inner monitor proxies the setters to the outer monitor
  private readonly _monitor = new MonitorEmitter(() => {
    if (this._equals(this._value, this._getValue(UNTRACKED_MONITOR))) {
      // subscribe back to the dependencies
      injectMonitor(this._getValue, this._monitor)
    } else {
      this._stale = true
      enqueue((push) => push(this._emitters))
    }
  }, true)._create()

  // biome-ignore lint/style/noNonNullAssertion: the value is never null because it assigns the value from the _getValue on the first _getter call
  private _value: T = null!
  private _stale = true

  public constructor(
    private readonly _getValue: (monitor: Monitor) => T,
    private readonly _setValue: (value: T, monitor: Monitor) => void,
    equals: Equal<T>,
  ) {
    super(equals)
  }

  protected _getter(): T {
    const value = this._getValue(this._monitor)

    if (this._stale) {
      this._value = value
      this._stale = false
    }

    return this._value
  }

  protected _setter(value: T): boolean {
    this._setValue(value, UNTRACKED_MONITOR)

    return false
  }

  protected _clone(value: T, equals: Equal<T>): Signal<T> {
    return new Signal(value, equals)
  }
}

export { DerivedSignal }
