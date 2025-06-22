import { BaseImpulse } from "./base-impulse"
import type { Compare } from "./compare"
import { DirectImpulse } from "./direct-impulse"
import { EMITTER_KEY, STATIC_SCOPE, type Scope } from "./scope"
import { ScopeEmitter } from "./scope-emitter"

export class DerivedImpulse<T> extends BaseImpulse<T> {
  // the inner scope proxies the setters to the outer scope
  private readonly _scope = {
    [EMITTER_KEY]: ScopeEmitter._init(() => {
      if (
        this._compare(this._value, this._getValue(STATIC_SCOPE), STATIC_SCOPE)
      ) {
        // subscribe back to the dependencies
        this._getValue(this._scope)
        // adjust the version since the value didn't change
        this._version = this._scope[EMITTER_KEY]._getVersion()
      } else {
        ScopeEmitter._schedule((enqueue) => enqueue(this._emitters))
      }
    }),
  } satisfies Scope

  // the value is never null because it assigns the value from the _getValue on the first _getter call
  private _value: T = null as never
  private _version?: number

  public constructor(
    private readonly _getValue: (scope: Scope) => T,
    private readonly _setValue: (value: T, scope: Scope) => void,
    compare: Compare<T>,
  ) {
    super(compare)
  }

  protected _getter(): T {
    const value = this._getValue(this._scope)
    const version = this._scope[EMITTER_KEY]._getVersion()

    if (this._version !== version) {
      this._value = value
      this._version = version
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
