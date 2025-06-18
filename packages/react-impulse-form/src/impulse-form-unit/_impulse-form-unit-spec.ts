import { Lazy } from "~/tools/lazy"
import type { Option } from "~/tools/option"
import { resolveSetter } from "~/tools/setter"

import { type Compare, Impulse, untrack } from "../dependencies"
import type {
  ImpulseFormSpec,
  ImpulseFormSpecPatch,
} from "../impulse-form/impulse-form-spec"

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
    private readonly _transform: ImpulseFormUnitTransform<
      TInput,
      TError,
      TOutput
    >,
    private readonly _isInputEqual: Compare<TInput>,
    public readonly _isOutputEqual: Compare<null | TOutput>,
    public readonly _isErrorEqual: Compare<null | TError>,
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

  public _override({
    _input,
    _initial,
    _error,
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

    return new ImpulseFormUnitSpec(
      input._getOrElse(this._input),
      initial._orElse(this._optionalInitial),
      error._orElse(this._optionalError),
      this._transform,
      this._isInputEqual,
      this._isOutputEqual,
      this._isErrorEqual,
    )
  }

  public _create(): ImpulseFormUnit<TInput, TError, TOutput> {
    return new ImpulseFormUnit(
      this,
      Lazy(() => {
        const input = this._input
        const initial = untrack((scope) => {
          return this._isInputEqual(this._initial, input, scope)
            ? input
            : this._initial
        })

        const error = this._error

        return new ImpulseFormUnitState(
          this,
          Impulse(input, { compare: this._isInputEqual }),
          Impulse(initial, { compare: this._isInputEqual }),
          Impulse(error, { compare: this._isErrorEqual }),
          Impulse(this._transform),
        )
      }),
    )
  }
}
