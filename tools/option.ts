export interface Option<T> {
  _getOrElse(): undefined | T
  _getOrElse(fallback: T): T
  _getOrElse<R>(fallback: R): T | R
}

export class Some<T> implements Option<T> {
  public constructor(private readonly _value: T) {}

  public _getOrElse(): T {
    return this._value
  }
}

export const None = {
  _getOrElse(fallback: unknown = undefined): unknown {
    return fallback
  },
} as Option<never>
