import { uniq, type Func } from "./utils"

export class Emitter<
  TArgs extends ReadonlyArray<unknown> = [],
  TResult = void,
> {
  private readonly _listeners: Array<Func<TArgs, TResult>> = []

  public _subscribe(listener: Func<TArgs, TResult>): VoidFunction {
    this._listeners.push(listener)

    return () => {
      this._listeners.splice(this._listeners.indexOf(listener), 1)
    }
  }

  public _emit(...args: TArgs): ReadonlyArray<TResult> {
    return uniq(this._listeners).map((listener) => listener(...args))
  }

  public _isEmpty(): boolean {
    return this._listeners.length === 0
  }
}
