import { resolveSetter } from "~/tools/setter"

import { type Compare, Impulse, untrack } from "../dependencies"
import type { ImpulseForm } from "../impulse-form/impulse-form"
import type {
  ImpulseFormSpec,
  ImpulseFormSpecPatch,
} from "../impulse-form/impulse-form-spec"
import type { ValidateStrategy } from "../validate-strategy"

import { ImpulseFormUnit } from "./_impulse-form-unit"
import type { ImpulseFormUnitParams } from "./_impulse-form-unit-params"
import type { ImpulseFormUnitTransform } from "./_impulse-form-unit-transform"

export class ImpulseFormUnitSpec<TInput, TError, TOutput>
  implements ImpulseFormSpec<ImpulseFormUnitParams<TInput, TError, TOutput>>
{
  public readonly _input: TInput

  public constructor(
    input: TInput,
    public readonly _initial: Impulse<TInput>,
    public readonly _error: null | TError,
    public readonly _validateOn: ValidateStrategy,
    public readonly _touched: boolean,
    public readonly _transform: ImpulseFormUnitTransform<
      TInput,
      TError,
      TOutput
    >,
    public readonly _isInputDirty: Compare<TInput>,
    public readonly _isInputEqual: Compare<TInput>,
    public readonly _isOutputEqual: Compare<null | TOutput>,
    public readonly _isErrorEqual: Compare<null | TError>,
  ) {
    this._input = untrack((scope) => {
      const initial = _initial.getValue(scope)

      return _isInputEqual(initial, input, scope) ? initial : input
    })
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
      return resolveSetter(setter, this._input, untrack(this._initial))
    })

    const initial = _initial._map((setter) => {
      return Impulse(resolveSetter(setter, untrack(this._initial), this._input))
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
      initial._getOrElse(this._initial),
      error._getOrElse(this._error),
      validateOn._getOrElse(this._validateOn),
      touched._getOrElse(this._touched),
      this._transform,
      this._isInputDirty,
      this._isInputEqual,
      this._isOutputEqual,
      this._isErrorEqual,
    )
  }

  public _childOf(
    parent: ImpulseForm,
    initial: Impulse<TInput>,
  ): ImpulseFormUnit<TInput, TError, TOutput> {
    const spec = new ImpulseFormUnitSpec(
      this._input,
      initial,
      this._error,
      this._validateOn,
      this._touched,
      this._transform,
      this._isInputDirty,
      this._isInputEqual,
      this._isOutputEqual,
      this._isErrorEqual,
    )

    return new ImpulseFormUnit(parent, spec)
  }
}
