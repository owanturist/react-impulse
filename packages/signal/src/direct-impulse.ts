import { BaseImpulse } from "./base-impulse"
import type { Compare } from "./compare"
import { STATIC_SCOPE } from "./scope"

export class DirectImpulse<T> extends BaseImpulse<T> {
  public constructor(
    private _value: T,
    compare: Compare<T>,
  ) {
    super(compare)
  }

  protected _getter(): T {
    return this._value
  }

  protected _setter(value: T): boolean {
    if (!this._compare(this._value, value, STATIC_SCOPE)) {
      this._value = value

      return true
    }

    return false
  }

  protected _clone(value: T, compare: Compare<T>): DirectImpulse<T> {
    return new DirectImpulse(value, compare)
  }
}
