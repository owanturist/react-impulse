import { isFunction } from "~/tools/is-function"
import { isStrictEqual } from "~/tools/is-strict-equal"

import type { Compare } from "./compare"
import type { Impulse } from "./impulse"
import type { ImpulseOptions } from "./impulse-options"
import { EMITTER_KEY, type Scope, UNTRACKED_SCOPE, extractScope } from "./scope"
import { ScopeEmitter, type ScopeEmitterQueue } from "./scope-emitter"

export abstract class BaseImpulse<T> implements Impulse<T> {
  protected readonly _emitters = new Set<WeakRef<ScopeEmitter>>()

  protected constructor(protected readonly _compare: Compare<T>) {}

  protected abstract _getter(): T

  protected abstract _setter(value: T, queue: ScopeEmitterQueue): void

  protected abstract _clone(value: T, compare: Compare<T>): Impulse<T>

  /**
   * Return the value when serializing to JSON.
   * It does not encode an Impulse for decoding it back due to runtime parts of the class,
   * that cannot be serialized as JSON.
   *
   * The method is protected in order to make it impossible to make the implicit call.
   *
   * @since 1.0.0
   */
  protected toJSON(): unknown {
    const scope = extractScope()

    return this.getValue(scope)
  }

  /**
   * Return the stringified value when an Impulse converts to a string.
   *
   * The method is protected in order to make it impossible to make the implicit call.
   * @since 1.0.0
   */
  protected toString(): string {
    const scope = extractScope()

    return String(this.getValue(scope))
  }

  public getValue(scope: Scope): T {
    scope[EMITTER_KEY]?._attachTo(this._emitters)

    return this._getter()
  }

  public setValue(
    valueOrTransform: T | ((currentValue: T, scope: Scope) => T),
  ): void {
    ScopeEmitter._schedule((queue) => {
      const nextValue = isFunction(valueOrTransform)
        ? valueOrTransform(this._getter(), UNTRACKED_SCOPE)
        : valueOrTransform

      this._setter(nextValue, queue)
    })
  }

  public clone(
    transformOrOptions?: ((value: T, scope: Scope) => T) | ImpulseOptions<T>,
    maybeOptions?: ImpulseOptions<T>,
  ): Impulse<T> {
    const value = this._getter()

    const [clonedValue, { compare = this._compare } = {}] = isFunction(
      transformOrOptions,
    )
      ? [transformOrOptions(value, UNTRACKED_SCOPE), maybeOptions]
      : [value, transformOrOptions]

    return this._clone(clonedValue, compare ?? isStrictEqual)
  }
}
