import { isNull } from "~/tools/is-null"
import type { Option } from "~/tools/option"
import { resolveSetter } from "~/tools/setter"

import { type Compare, Impulse, untrack } from "../dependencies"
import type {
  ImpulseFormSpec,
  ImpulseFormSpecPatch,
} from "../impulse-form/impulse-form-spec"
import type { Result } from "../result"
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
    const input = Impulse(this._input, {
      compare: this._isInputEqual,
    })

    const initial = Impulse(
      untrack((scope) => {
        return this._isInputEqual(this._initial, this._input, scope)
          ? this._input
          : this._initial
      }),
      {
        compare: this._isInputEqual,
      },
    )

    const transform = Impulse(this._transform)

    const touched = Impulse(this._touched)

    const dirty = Impulse((scope) => {
      return this._isInputDirty(
        initial.getValue(scope),
        input.getValue(scope),
        scope,
      )
    })

    const validateOn = Impulse(this._validateOn)

    const validated = Impulse(false)

    const customError = Impulse(this._error, {
      compare: this._isErrorEqual,
    })

    const result = Impulse<Result<null | TError, TOutput>>(
      (scope) => {
        const _customError = customError.getValue(scope)

        if (!isNull(_customError)) {
          return [_customError, null]
        }

        const _input = input.getValue(scope)
        const _transform = transform.getValue(scope)

        const [error, output] = _transform._validator(_input)

        if (!isNull(output)) {
          return [null, output]
        }

        return [validated.getValue(scope) ? error : null, null]
      },
      {
        compare: (
          [leftError, leftOutput],
          [rightError, rightOutput],
          scope,
        ) => {
          return (
            this._isErrorEqual(leftError, rightError, scope) &&
            this._isOutputEqual(leftOutput, rightOutput, scope)
          )
        },
      },
    )

    const state = new ImpulseFormUnitState(
      input,
      initial,
      transform,
      touched,
      dirty,
      validateOn,
      validated,
      customError,
      result,
    )

    return new ImpulseFormUnit(this, state)
  }
}
