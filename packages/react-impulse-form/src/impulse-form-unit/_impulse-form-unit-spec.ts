import type { Option } from "~/tools/option"

import { batch, type Compare, Impulse } from "../dependencies"
import type { ImpulseForm } from "../impulse-form"
import type { ImpulseFormSnapshot } from "../impulse-form/impulse-form-spec"
import type { ValidateStrategy } from "../validate-strategy"

import { ImpulseFormUnit } from "./_impulse-form-unit"
import type { ImpulseFormUnitParams } from "./_impulse-form-unit-params"
import type { ImpulseFormUnitValidator } from "./impulse-form-unit-validator"

export class ImpulseFormUnitSpec<TInput, TError, TOutput>
  implements ImpulseFormSnapshot<ImpulseFormUnitParams<TInput, TError, TOutput>>
{
  public constructor(
    public readonly _input: TInput,
    public readonly _initial: Option<TInput>,
    public readonly _touched: Option<boolean>,
    public readonly _error: Option<TError>,
    public readonly _validateOn: Option<ValidateStrategy>,
    public readonly _validator: Option<
      ImpulseFormUnitValidator<TInput, TError, TOutput>
    >,
    public readonly _isInputEqual: Option<Compare<TInput>>,
    public readonly _isInputDirty: Option<Compare<TInput>>,
  ) {}

  public _restore(
    root: null | ImpulseForm,
  ): ImpulseFormUnit<TInput, TError, TOutput> {
    return new ImpulseFormUnit(
      root,
      this,
      Impulse(false),
      Impulse<null | TError>(null),
      Impulse(this._initial.getValue(scope)._value, {
        compare: this._isInputEqual,
      }),
    )
  }

  public _merge(override: this): this {}
}
