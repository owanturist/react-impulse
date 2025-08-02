import { Impulse, type Scope } from "../dependencies"

function compareCurrent<TValue>(
  left: { _current: TValue },
  right: { _current: TValue },
): boolean {
  return left._current === right._current
}

export class ImpulseFormInitial<TValue> {
  public static _of<TValue>(
    initial: TValue,
    onClone: (value: TValue) => TValue,
  ): ImpulseFormInitial<TValue> {
    return new ImpulseFormInitial(
      Impulse({ _current: initial }, { compare: compareCurrent }),
      onClone,
    )
  }

  public constructor(
    private readonly _value: Impulse<{ _current: TValue }>,
    private readonly _onClone: (value: TValue) => TValue,
  ) {}

  public _getCurrent(scope: Scope): TValue {
    return this._value.getValue(scope)._current
  }

  public _replace(value: TValue): void {
    this._value.setValue({ _current: value })
  }

  public _clone(): ImpulseFormInitial<TValue> {
    const value = this._value.clone(({ _current }) => ({
      _current: this._onClone(_current),
    }))

    return new ImpulseFormInitial(value, this._onClone)
  }
}
