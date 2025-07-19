import { Lazy } from "~/tools/lazy"

import { Impulse } from "../dependencies"
import { ImpulseForm } from "../impulse-form"

import type { ImpulseFormUnitParams } from "./_impulse-form-unit-params"
import type { ImpulseFormUnitSpec } from "./_impulse-form-unit-spec"
import { ImpulseFormUnitState } from "./_impulse-form-unit-state"
import type { ImpulseFormUnitTransformer } from "./impulse-form-unit-transformer"

export class ImpulseFormUnit<
  TInput,
  TError = null,
  TOutput = TInput,
> extends ImpulseForm<ImpulseFormUnitParams<TInput, TError, TOutput>> {
  public readonly _state: Lazy<ImpulseFormUnitState<TInput, TError, TOutput>>

  public constructor(
    root: null | ImpulseForm,
    public readonly _spec: ImpulseFormUnitSpec<TInput, TError, TOutput>,
  ) {
    super(root)

    this._state = Lazy(() => {
      return new ImpulseFormUnitState(
        Impulse(_spec._input, { compare: _spec._isInputEqual }),
        _spec._initial,
        Impulse(_spec._error, { compare: _spec._isErrorEqual }),
        Impulse(_spec._validateOn),
        Impulse(_spec._touched),
        Impulse(_spec._transform),
        _spec._isInputDirty,
        _spec._isOutputEqual,
        _spec._isErrorEqual,
      )
    })
  }

  public setTransform(
    transformer: ImpulseFormUnitTransformer<TInput, TOutput>,
  ): void {
    this._state._peek()._setTransform(transformer)
  }
}
