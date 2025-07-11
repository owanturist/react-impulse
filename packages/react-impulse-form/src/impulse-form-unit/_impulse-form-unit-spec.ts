import { Lazy } from "~/tools/lazy"
import type { Option } from "~/tools/option"
import { resolveSetter } from "~/tools/setter"

import { type Compare, Impulse, untrack } from "../dependencies"
import type {
  ImpulseFormSpec,
  ImpulseFormSpecPatch,
} from "../impulse-form/impulse-form-spec"
import type { ImpulseFormState } from "../impulse-form/impulse-form-state"
import { VALIDATE_ON_TOUCH, type ValidateStrategy } from "../validate-strategy"

import { ImpulseFormUnit } from "./_impulse-form-unit"
import type { ImpulseFormUnitParams } from "./_impulse-form-unit-params"
import { ImpulseFormUnitState } from "./_impulse-form-unit-state"
import type { ImpulseFormUnitTransform } from "./_impulse-form-unit-transform"

export class ImpulseFormUnitSpec<TInput, TError, TOutput>
  implements ImpulseFormSpec<ImpulseFormUnitParams<TInput, TError, TOutput>>
{
  public constructor(
    input: TInput,
    public readonly _initial: Impulse<TInput>,
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
  ) {
    this._input = untrack((scope) => {
      const initial = this._initial.getValue(scope)

      return _isInputEqual(initial, input, scope) ? initial : input
    })
  }

  public readonly _input: TInput

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
      return resolveSetter(setter, this._input, untrack(this._initial))
    })

    const initial = _initial._map((setter) => {
      return Impulse(
        resolveSetter(setter, untrack(this._initial), this._input),
        {
          compare: this._isInputEqual,
        },
      )
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

  public _create(
    parent?: Lazy<ImpulseFormState>,
  ): ImpulseFormUnit<TInput, TError, TOutput> {
    const spec = Impulse(this)

    const state = Lazy(() => {
      return new ImpulseFormUnitState(
        parent,
        Impulse(
          (scope) => spec.getValue(scope)._initial.getValue(scope),
          (initial, scope) => {
            spec.getValue(scope)._initial.setValue(initial)
          },
        ),
        Impulse(this._input, { compare: this._isInputEqual }),
        Impulse(this._error, { compare: this._isErrorEqual }),
        Impulse(this._validateOn),
        Impulse(this._touched),
        Impulse(this._transform),
        this._isInputDirty,
        this._isOutputEqual,
        this._isErrorEqual,
      )
    })

    return new ImpulseFormUnit(spec, state)
  }
}
