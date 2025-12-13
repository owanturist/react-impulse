import type { Equal } from "../compare"

import { BaseSignal } from "./base-impulse"

class Signal<T> extends BaseSignal<T> {
  public constructor(
    private _value: T,
    equals: Equal<T>,
  ) {
    super(equals)
  }

  protected _getter(): T {
    return this._value
  }

  protected _setter(value: T): boolean {
    if (!this._equals(this._value, value)) {
      this._value = value

      return true
    }

    return false
  }

  protected _clone(value: T, equals: Equal<T>): Signal<T> {
    return new Signal(value, equals)
  }
}

export { Signal }
