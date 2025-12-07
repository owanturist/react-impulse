import type { Equal } from "../equal"

import { BaseImpulse } from "./base-impulse"

class Impulse<T> extends BaseImpulse<T> {
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

  protected _clone(value: T, equals: Equal<T>): Impulse<T> {
    return new Impulse(value, equals)
  }
}

export { Impulse }
