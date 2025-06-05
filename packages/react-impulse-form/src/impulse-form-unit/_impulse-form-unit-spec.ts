import { isFunction } from "~/tools/is-function"
import { Lazy } from "~/tools/lazy"
import { type Option, Some } from "~/tools/option"

import { type Compare, Impulse, untrack } from "../dependencies"
import type {
  ImpulseFormSpec,
  ImpulseFormSpecPatch,
} from "../impulse-form/impulse-form-spec"

import { ImpulseFormUnit } from "./_impulse-form-unit"
import type { ImpulseFormUnitParams } from "./_impulse-form-unit-params"
import { ImpulseFormUnitState } from "./_impulse-form-unit-state"
import type { ImpulseFormUnitTransform } from "./_impulse-form-unit-transform"
import type { ImpulseFormUnitInputSetter } from "./impulse-form-unit-input-setter"

export class ImpulseFormUnitSpec<TInput, TError, TOutput>
  implements ImpulseFormSpec<ImpulseFormUnitParams<TInput, TError, TOutput>>
{
  public constructor(
    public readonly _input: TInput,
    public readonly _initial: Option<TInput>,
    public readonly _error: Option<null | TError>,
    public readonly _transform: ImpulseFormUnitTransform<
      TInput,
      TError,
      TOutput
    >,
    public readonly _isInputEqual: Compare<TInput>,
    public readonly _isOutputEqual: Compare<null | TOutput>,
    public readonly _isErrorEqual: Compare<null | TError>,
  ) {}

  public _outputFromVerbose(output: null | TOutput): null | TOutput {
    return output
  }

  public _inputFromSetter(
    setter: ImpulseFormUnitInputSetter<TInput>,
    first: () => TInput,
    second: () => TInput,
  ): TInput {
    return isFunction(setter) ? setter(first(), second()) : setter
  }

  public _update({
    _input,
    _initial,
    _error,
  }: Partial<
    ImpulseFormSpecPatch<ImpulseFormUnitParams<TInput, TError, TOutput>>
  >): ImpulseFormUnitSpec<TInput, TError, TOutput> {
    const input = _input ? _input(this._input) : this._input

    const initial = _initial
      ? Some(_initial(this._initial._getOrElse(input)))
      : this._initial

    const error = _error
      ? Some(_error(this._error._getOrElse(null)))
      : this._error

    return new ImpulseFormUnitSpec(
      input,
      initial,
      error,
      this._transform,
      this._isInputEqual,
      this._isOutputEqual,
      this._isErrorEqual,
    )
  }

  public _create(): ImpulseFormUnit<TInput, TError, TOutput> {
    throw new ImpulseFormUnit(
      this,
      Lazy(() => {
        const input = this._input
        const initial = this._initial._getOrElse(input)
        const inputOrInitial = untrack((scope) => {
          return this._isInputEqual(initial, input, scope) ? initial : input
        })

        const error = this._error._getOrElse(null)

        return new ImpulseFormUnitState(
          this,
          Impulse(inputOrInitial, { compare: this._isInputEqual }),
          Impulse(initial, { compare: this._isInputEqual }),
          Impulse(error, { compare: this._isErrorEqual }),
          Impulse(this._transform),
        )
      }),
    )
  }
}
