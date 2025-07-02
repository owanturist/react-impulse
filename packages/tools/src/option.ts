import { isUndefined } from "~/tools/is-undefined"

export interface Option<T> {
  _orElse(another: Option<T>): Option<T>

  _getOrElse(fallback: T): T

  _getOrUndefined(): undefined | T

  _map<R>(fn: (value: T) => R): Option<R>

  _chain<R>(fn: (value: T) => Option<R>): Option<R>
}

export function Option<TValue>(value: TValue | undefined): Option<TValue> {
  return isUndefined(value) ? None : Some(value)
}

class SomeImpl<T> implements Option<T> {
  public constructor(private readonly _value: T) {}

  public _orElse(): Option<T> {
    return this
  }

  public _getOrElse(): T {
    return this._value
  }

  public _getOrUndefined(): T {
    return this._value
  }

  public _map<R>(fn: (value: T) => R): Option<R> {
    return new SomeImpl(fn(this._value))
  }

  public _chain<R>(fn: (value: T) => Option<R>): Option<R> {
    return fn(this._value)
  }
}

export function Some<T>(value: T): Option<T> {
  return new SomeImpl(value)
}

export const None = new (class implements Option<never> {
  public _orElse<R>(another: Option<R>): Option<R> {
    return another
  }

  public _getOrElse<R>(fallback: R): R {
    return fallback
  }

  public _getOrUndefined(): undefined {
    return undefined
  }

  public _map(): Option<never> {
    return this
  }

  public _chain(): Option<never> {
    return this
  }
})()
