import { isNull } from "~/tools/is-null"
import { resolveSetter } from "~/tools/setter"

import { Impulse, type ReadonlyImpulse, batch } from "../dependencies"
import type { ImpulseFormState } from "../impulse-form/impulse-form-state"
import type { Result } from "../result"
import {
  VALIDATE_ON_CHANGE,
  VALIDATE_ON_INIT,
  VALIDATE_ON_SUBMIT,
  VALIDATE_ON_TOUCH,
  type ValidateStrategy,
} from "../validate-strategy"

import type { ImpulseFormUnitParams } from "./_impulse-form-unit-params"
import {
  type ImpulseFormUnitTransform,
  transformFromTransformer,
} from "./_impulse-form-unit-transform"
import type { ImpulseFormUnitErrorSetter } from "./impulse-form-unit-error-setter"
import type { ImpulseFormUnitInputSetter } from "./impulse-form-unit-input-setter"
import type { ImpulseFormUnitTransformer } from "./impulse-form-unit-transformer"
import type { ImpulseFormUnitValidateOnSetter } from "./impulse-form-unit-validate-on-setter"

export class ImpulseFormUnitState<TInput, TError, TOutput>
  implements ImpulseFormState<ImpulseFormUnitParams<TInput, TError, TOutput>>
{
  public constructor(
    public readonly _input: Impulse<TInput>,
    public readonly _initial: Impulse<TInput>,
    public readonly _transform: Impulse<
      ImpulseFormUnitTransform<TInput, TError, TOutput>
    >,
    public readonly _touched: Impulse<boolean>,
    public readonly _dirty: ReadonlyImpulse<boolean>,
    public readonly _validateOn: Impulse<ValidateStrategy>,
    public readonly _validated: Impulse<boolean>,
    private readonly _customError: Impulse<null | TError>,
    private readonly _result: ReadonlyImpulse<Result<null | TError, TOutput>>,
  ) {
    this._validate()
  }

  private _validate(revalidate = false): void {
    this._validated.setValue((validated, scope) => {
      if (
        (!revalidate && validated) ||
        this._transform.getValue(scope)._transformer
      ) {
        return true
      }

      switch (this._validateOn.getValue(scope)) {
        case VALIDATE_ON_INIT: {
          return true
        }

        case VALIDATE_ON_TOUCH: {
          return this._touched.getValue(scope)
        }

        case VALIDATE_ON_CHANGE: {
          return this._dirty.getValue(scope)
        }

        case VALIDATE_ON_SUBMIT: {
          return false
        }
      }
    })
  }

  public _setInitial(setter: ImpulseFormUnitInputSetter<TInput>): void {
    this._initial.setValue((initial, scope) => {
      return resolveSetter(setter, initial, this._input.getValue(scope))
    })

    batch((scope) => {
      const before = this._initial.getValue(scope)

      this._initial.setValue(
        resolveSetter(setter, before, this._input.getValue(scope)),
      )

      const after = this._initial.getValue(scope)

      if (before !== after) {
        this._validate()
      }
    })
  }

  public _setInput(setter: ImpulseFormUnitInputSetter<TInput>): void {
    batch((scope) => {
      const before = this._input.getValue(scope)

      this._input.setValue(
        resolveSetter(setter, before, this._initial.getValue(scope)),
      )

      const after = this._input.getValue(scope)

      if (before !== after) {
        this._validate()
      }
    })
  }

  public readonly _error = Impulse<null | TError>((scope) => {
    const [error] = this._result.getValue(scope)

    return error
  })

  public _errorVerbose = this._error

  public _setError(setter: ImpulseFormUnitErrorSetter<TError>): void {
    this._customError.setValue((error) => resolveSetter(setter, error))
  }

  public _validateOnVerbose = this._validateOn

  public _setValidateOn(setter: ImpulseFormUnitValidateOnSetter): void {
    batch((scope) => {
      const before = this._validateOn.getValue(scope)

      this._validateOn.setValue(resolveSetter(setter, before))

      const after = this._validateOn.getValue(scope)

      if (before !== after) {
        this._validate(true)
      }
    })
  }

  public _touchedVerbose = this._touched

  public _setTouched(
    setter: ImpulseFormUnitParams<TInput, TError, TOutput>["flag.setter"],
  ): void {
    batch(() => {
      this._touched.setValue((touched) => resolveSetter(setter, touched))
      this._validate()
    })
  }

  public readonly _output = Impulse((scope) => {
    const [, output] = this._result.getValue(scope)

    return output
  })

  public _outputVerbose = this._output

  public readonly _valid = Impulse((scope) => {
    const error = this._error.getValue(scope)

    return isNull(error)
  })

  public _validVerbose = this._valid

  public readonly _invalid = Impulse((scope) => {
    const error = this._error.getValue(scope)

    return !isNull(error)
  })

  public _invalidVerbose = this._invalid

  public _validatedVerbose = this._validated

  public _dirtyVerbose = this._dirty

  public reset(): void {
    // TODO add rest of reset logic
    this._validate(true)
  }

  public _setTransform(
    transformer: ImpulseFormUnitTransformer<TInput, TOutput>,
  ): void {
    batch(() => {
      this._transform.setValue(transformFromTransformer(transformer))
      this._validate()
    })
  }
}
