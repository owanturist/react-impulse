import type { Lazy } from "~/tools/lazy"

import type { Impulse } from "../dependencies"
import { ImpulseForm } from "../impulse-form"
import type { ImpulseFormSpec } from "../impulse-form/impulse-form-spec"

import type { ImpulseFormUnitParams } from "./_impulse-form-unit-params"
import type { ImpulseFormUnitState } from "./_impulse-form-unit-state"
import type { ImpulseFormUnitTransformer } from "./impulse-form-unit-transformer"

export class ImpulseFormUnit<
  TInput,
  TError = null,
  TOutput = TInput,
> extends ImpulseForm<ImpulseFormUnitParams<TInput, TError, TOutput>> {
  public constructor(
    public readonly _spec: Impulse<
      ImpulseFormSpec<ImpulseFormUnitParams<TInput, TError, TOutput>>
    >,
    public readonly _state: Lazy<ImpulseFormUnitState<TInput, TError, TOutput>>,
  ) {
    super()
  }

  public setTransform(
    transformer: ImpulseFormUnitTransformer<TInput, TOutput>,
  ): void {
    this._state._peek()._setTransform(transformer)
  }
}
