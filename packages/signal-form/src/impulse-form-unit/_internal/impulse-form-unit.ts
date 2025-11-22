import { ImpulseForm } from "../../impulse-form/_internal/impulse-form"
import type { ImpulseFormUnitParams } from "../impulse-form-unit-params"
import type { ImpulseFormUnitTransformer } from "../impulse-form-unit-transformer"

import type { ImpulseFormUnitState } from "./impulse-form-unit-state"

class ImpulseFormUnit<TInput, TError, TOutput> extends ImpulseForm<
  ImpulseFormUnitParams<TInput, TError, TOutput>
> {
  public constructor(public readonly _state: ImpulseFormUnitState<TInput, TError, TOutput>) {
    super()
  }

  public setTransform(transformer: ImpulseFormUnitTransformer<TInput, TOutput>): void {
    this._state._setTransform(transformer)
  }
}

export { ImpulseFormUnit }
