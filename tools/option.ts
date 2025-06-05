export interface Option<T> {
  _getOrElse<R = T>(fallback: R): T | R

  _getOrUndefined(): undefined | T
}

class SomeImpl<T> implements Option<T> {
  public constructor(private readonly _value: T) {}

  public _getOrElse(): T {
    return this._value
  }

  public _getOrUndefined(): T {
    return this._value
  }
}

export function Some<T>(value: T): Option<T> {
  return new SomeImpl(value)
}

export const None: Option<never> = {
  _getOrElse<R>(fallback: R): R {
    return fallback
  },

  _getOrUndefined(): undefined {
    return undefined
  },
}
