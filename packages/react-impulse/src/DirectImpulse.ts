import { BaseImpulse } from "./BaseImpulse"
import { STATIC_SCOPE } from "./Scope"
import type { ScopeEmitter } from "./ScopeEmitter"
import type { Compare } from "./utils"

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
