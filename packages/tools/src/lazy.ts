import { isUndefined } from "~/tools/is-undefined"

export interface Lazy<T> {
  _peek(): T
  _map<R>(transform: (value: T) => R): Lazy<R>
}

export function Lazy<T>(init: () => T): Lazy<T> {
  return new Uninitialized(init)
}

class Uninitialized<T> implements Lazy<T> {
  private _value?: T

  public constructor(private readonly _init: () => T) {}

  public _peek(): T {
    this._value = this._value ?? this._init()

    return this._value
  }

  public _map<R>(transform: (value: T) => R): Lazy<R> {
    if (isUndefined(this._value)) {
      return new Uninitialized(() => transform(this._peek()))
    }

    return new Initialized(transform(this._value))
  }
}
console.log("TODO map is not used - remove the Initialized")
class Initialized<T> implements Lazy<T> {
  public constructor(public readonly _value: T) {}

  public _peek(): T {
    return this._value
  }

  public _map<R>(transform: (value: T) => R): Lazy<R> {
    return new Initialized(transform(this._value))
  }
}
