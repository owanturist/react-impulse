export class ImpulseFormInitial<TValue> {
  public static _compare<TValue>(
    left: ImpulseFormInitial<TValue>,
    right: ImpulseFormInitial<TValue>,
  ): boolean {
    return left._current === right._current
  }

  public constructor(public readonly _current: TValue) {}
}
