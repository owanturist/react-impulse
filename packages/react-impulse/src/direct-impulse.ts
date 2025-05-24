import { BaseImpulse } from "./base-impulse"
import { STATIC_SCOPE } from "./_Scope"
import type { ScopeEmitter } from "./scope-emitter"
import type { Compare } from "./compare"

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

  protected _setter(
    value: T,
    queue: Array<ReadonlySet<WeakRef<ScopeEmitter>>>,
  ): void {
    if (!this._compare(this._value, value, STATIC_SCOPE)) {
      this._value = value
      queue.push(this._emitters)
    }
  }
}
