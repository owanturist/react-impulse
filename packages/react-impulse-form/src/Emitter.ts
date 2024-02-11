import type { Func } from "./utils"

export class Emitter<
  TArgs extends ReadonlyArray<unknown> = [],
  TResult = void,
> {
  public static _init<
    TArgs extends ReadonlyArray<unknown> = [],
    TResult = void,
  >(): Emitter<TArgs, TResult> {
    return new Emitter()
  }

  private readonly _listeners: Array<Func<TArgs, TResult>> = []

  private constructor() {}

  public _subscribe(listener: Func<TArgs, TResult>): VoidFunction {
    this._listeners.push(listener)

    return () => {
      this._listeners.splice(this._listeners.indexOf(listener), 1)
    }
  }

  public _emit(...args: TArgs): ReadonlyArray<TResult> {
    return this._listeners.map((listener) => listener(...args))
  }

  public _isEmpty(): boolean {
    return this._listeners.length === 0
  }
}
