import { map } from "~/tools/map"

class Emitter<TPayload = unknown, TResult = void> {
  private readonly _listeners: Array<(payload: TPayload) => TResult> = []

  public _subscribe(listener: (payload: TPayload) => TResult): VoidFunction {
    this._listeners.push(listener)

    return () => {
      this._listeners.splice(this._listeners.indexOf(listener), 1)
    }
  }

  public _emit(payload: TPayload): ReadonlyArray<TResult> {
    return map(new Set(this._listeners), (listener) => listener(payload))
  }

  public _isEmpty(): boolean {
    return this._listeners.length === 0
  }
}

export { Emitter }
