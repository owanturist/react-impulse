import type { Option } from "~/tools/option"
import { resolveSetter } from "~/tools/setter"

import { type Compare, Impulse, untrack } from "../dependencies"
import type {
  ImpulseFormSpec,
  ImpulseFormSpecPatch,
} from "../impulse-form/impulse-form-spec"
import { VALIDATE_ON_TOUCH, type ValidateStrategy } from "../validate-strategy"

import { ImpulseFormUnit } from "./_impulse-form-unit"
import type { ImpulseFormUnitParams } from "./_impulse-form-unit-params"
import { ImpulseFormUnitState } from "./_impulse-form-unit-state"
import type { ImpulseFormUnitTransform } from "./_impulse-form-unit-transform"

export class ImpulseFormUnitSpec<TInput, TError, TOutput>
  implements ImpulseFormSpec<ImpulseFormUnitParams<TInput, TError, TOutput>>
{
  public constructor(
    public readonly _input: TInput,
    private readonly _optionalInitial: Option<TInput>,
    private readonly _optionalError: Option<null | TError>,
    private readonly _optionalValidateOn: Option<ValidateStrategy>,
    private readonly _optionalTouched: Option<boolean>,
    private readonly _transform: ImpulseFormUnitTransform<
      TInput,
      TError,
      TOutput
    >,
    private readonly _isInputDirty: Compare<TInput>,
    private readonly _isInputEqual: Compare<TInput>,
    private readonly _isOutputEqual: Compare<null | TOutput>,
    private readonly _isErrorEqual: Compare<null | TError>,
  ) {}

  public _outputFromVerbose(output: null | TOutput): null | TOutput {
    return output
  }

  public get _initial(): TInput {
    return this._optionalInitial._getOrElse(this._input)
  }

  public get _error(): null | TError {
    return this._optionalError._getOrElse(null)
  }

  public get _validateOn(): ValidateStrategy {
    return this._optionalValidateOn._getOrElse(VALIDATE_ON_TOUCH)
  }

  public get _touched(): boolean {
    return this._optionalTouched._getOrElse(false)
  }

  public _override({
    _input,
    _initial,
    _error,
    _validateOn,
    _touched,
  }: ImpulseFormSpecPatch<
    ImpulseFormUnitParams<TInput, TError, TOutput>
  >): ImpulseFormUnitSpec<TInput, TError, TOutput> {
    const input = _input._map((setter) => {
      return resolveSetter(setter, this._input, this._initial)
    })

    const initial = _initial._map((setter) => {
      return resolveSetter(setter, this._initial, this._input)
    })

    const error = _error._map((setter) => {
      return resolveSetter(setter, this._error)
    })

    const validateOn = _validateOn._map((setter) => {
      return resolveSetter(setter, this._validateOn)
    })

    const touched = _touched._map((setter) => {
      return resolveSetter(setter, this._touched)
    })

    return new ImpulseFormUnitSpec(
      input._getOrElse(this._input),
      initial._orElse(this._optionalInitial),
      error._orElse(this._optionalError),
      validateOn._orElse(this._optionalValidateOn),
      touched._orElse(this._optionalTouched),
      this._transform,
      this._isInputDirty,
      this._isInputEqual,
      this._isOutputEqual,
      this._isErrorEqual,
    )
  }

  public _create(): ImpulseFormUnit<TInput, TError, TOutput> {
    const initialOrInput = untrack((scope) => {
      return this._isInputEqual(this._initial, this._input, scope)
        ? this._input
        : this._initial
    })

    const state = new ImpulseFormUnitState(
      Impulse(this._input, { compare: this._isInputEqual }),
      Impulse(initialOrInput, { compare: this._isInputEqual }),
      Impulse(this._error, { compare: this._isErrorEqual }),
      Impulse(this._validateOn),
      Impulse(this._touched),
      Impulse(this._transform),
      this._isInputDirty,
      this._isOutputEqual,
      this._isErrorEqual,
    )

    return new ImpulseFormUnit(this, state)
  }
}
