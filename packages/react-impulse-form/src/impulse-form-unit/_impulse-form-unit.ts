import type { Impulse } from "../dependencies"
import { ImpulseForm } from "../impulse-form"

import type { ImpulseFormUnitParams } from "./_impulse-form-unit-params"
import type { ImpulseFormUnitState } from "./_impulse-form-unit-state"
import type { ImpulseFormUnitTransformer } from "./impulse-form-unit-transformer"

export class ImpulseFormUnit<
  TInput,
  TError = null,
  TOutput = TInput,
> extends ImpulseForm<ImpulseFormUnitParams<TInput, TError, TOutput>> {
  public constructor(
    parent: null | ImpulseForm,
    public readonly _state: ImpulseFormUnitState<TInput, TError, TOutput>,
  ) {
    super(parent)
  }

  protected _childOf(
    parent: ImpulseForm,
    initial: Impulse<TInput>,
  ): ImpulseFormUnit<TInput, TError, TOutput> {
    return new ImpulseFormUnit(parent, this._state._childOf(initial))
  }

  public setTransform(
    transformer: ImpulseFormUnitTransformer<TInput, TOutput>,
  ): void {
    this._state._setTransform(transformer)
  }
}
