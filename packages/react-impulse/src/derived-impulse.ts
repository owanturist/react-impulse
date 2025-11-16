import { BaseImpulse } from "./base-impulse"
import type { Compare } from "./compare"
import { DirectImpulse } from "./direct-impulse"
import { enqueue } from "./enqueue"
import { EMITTER_KEY, STATIC_SCOPE, type Scope, injectScope } from "./scope"
import { ScopeEmitter } from "./scope-emitter"

export class DerivedImpulse<T> extends BaseImpulse<T> {
  // the inner scope proxies the setters to the outer scope
  private readonly _scope = {
    [EMITTER_KEY]: new ScopeEmitter(() => {
      if (
        this._compare(this._value, this._getValue(STATIC_SCOPE), STATIC_SCOPE)
      ) {
        // subscribe back to the dependencies
        injectScope(this._getValue, this._scope)
      } else {
        this._stale = true
        enqueue((queue) => queue._push(this._emitters))
      }
    }, true),
  }

  // the value is never null because it assigns the value from the _getValue on the first _getter call
  private _value: T = null!
  private _stale = true

  public constructor(
    private readonly _getValue: (scope: Scope) => T,
    private readonly _setValue: (value: T, scope: Scope) => void,
    compare: Compare<T>,
  ) {
    super(compare)
  }

  protected _getter(): T {
    const value = this._getValue(this._scope)

    if (this._stale) {
      this._value = value
      this._stale = false
    }

    return this._value
  }

  protected _setter(value: T): void {
    this._setValue(value, STATIC_SCOPE)
  }

  protected _clone(value: T, compare: Compare<T>): DirectImpulse<T> {
    return new DirectImpulse(value, compare)
  }
}
