import { entries } from "~/tools/entries"
import { forEntries } from "~/tools/for-entries"
import { hasProperty } from "~/tools/has-property"
import { isBoolean } from "~/tools/is-boolean"
import { isFunction } from "~/tools/is-function"
import { isNull } from "~/tools/is-null"
import { isString } from "~/tools/is-string"
import { isUndefined } from "~/tools/is-undefined"
import { mapValues } from "~/tools/map-values"
import type { OmitValues } from "~/tools/omit-values"
import { values } from "~/tools/values"

import { Impulse, type ReadonlyImpulse, type Scope } from "../dependencies"
import type { ImpulseForm } from "../impulse-form/impulse-form"
import type { ImpulseFormParams } from "../impulse-form/impulse-form-params"
import {
  type ImpulseFormChild,
  ImpulseFormState,
} from "../impulse-form/impulse-form-state"
import { VALIDATE_ON_TOUCH, type ValidateStrategy } from "../validate-strategy"

import type { ImpulseFormShapeParams } from "./_impulse-form-shape-params"
import {
  type ImpulseFormShapeError,
  isImpulseFormShapeErrorEqual,
} from "./impulse-form-shape-error"
import type { ImpulseFormShapeErrorSetter } from "./impulse-form-shape-error-setter"
import {
  type ImpulseFormShapeErrorVerbose,
  isImpulseFormShapeErrorVerboseEqual,
} from "./impulse-form-shape-error-verbose"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"
import {
  type ImpulseFormShapeFlag,
  isImpulseFormShapeFlagEqual,
} from "./impulse-form-shape-flag"
import type { ImpulseFormShapeFlagSetter } from "./impulse-form-shape-flag-setter"
import {
  type ImpulseFormShapeFlagVerbose,
  isImpulseFormShapeFlagVerboseEqual,
} from "./impulse-form-shape-flag-verbose"
import {
  type ImpulseFormShapeInput,
  isImpulseFormShapeInputEqual,
} from "./impulse-form-shape-input"
import type { ImpulseFormShapeInputSetter } from "./impulse-form-shape-input-setter"
import {
  type ImpulseFormShapeOutput,
  isImpulseFormShapeOutputEqual,
} from "./impulse-form-shape-output"
import {
  type ImpulseFormShapeOutputVerbose,
  isImpulseFormShapeOutputVerboseEqual,
} from "./impulse-form-shape-output-verbose"
import {
  type ImpulseFormShapeValidateOn,
  isImpulseFormShapeValidateOnEqual,
} from "./impulse-form-shape-validate-on"
import type { ImpulseFormShapeValidateOnSetter } from "./impulse-form-shape-validate-on-setter"
import {
  type ImpulseFormShapeValidateOnVerbose,
  isImpulseFormShapeValidateOnVerboseEqual,
} from "./impulse-form-shape-validate-on-verbose"

export type ImpulseFormShapeStateFields<
  TFields extends ImpulseFormShapeFields,
> = OmitValues<
  {
    [TField in keyof TFields]: TFields[TField] extends ImpulseForm<
      infer TParams
    >
      ? ImpulseFormState<TParams>
      : never
  },
  never
>

export class ImpulseFormShapeState<
  TFields extends ImpulseFormShapeFields = ImpulseFormShapeFields,
> extends ImpulseFormState<ImpulseFormShapeParams<TFields>> {
  public readonly _isInputEqual = isImpulseFormShapeInputEqual

  public constructor(
    public readonly _initial: ReadonlyImpulse<ImpulseFormShapeInput<TFields>>,
    private readonly _fields: ImpulseFormShapeStateFields<TFields>,
    private readonly _constants: Omit<
      TFields,
      keyof ImpulseFormShapeStateFields<TFields>
    >,
  ) {
    super()
  }

  // I N I T I A L

  public _setInitial(
    scope: Scope,
    setter: ImpulseFormShapeInputSetter<TFields>,
  ): void {
    const setters = isFunction(setter)
      ? setter(this._initial.getValue(scope), this._input.getValue(scope))
      : setter

    forEntries(this._fields, (field, key) => {
      if (hasProperty(setters, key) && !isUndefined(setters[key])) {
        field._setInitial(scope, setters[key])
      }
    })
  }

  // I N P U T

  public readonly _input = Impulse(
    (scope) => {
      const input = mapValues(this._fields, ({ _input }) => {
        return _input.getValue(scope)
      })

      return {
        ...input,
        ...this._constants,
      } as ImpulseFormShapeInput<TFields>
    },

    {
      compare: isImpulseFormShapeInputEqual,
    },
  )

  public _setInput(
    scope: Scope,
    setter: ImpulseFormShapeInputSetter<TFields>,
  ): void {
    const setters = isFunction(setter)
      ? setter(this._input.getValue(scope), this._initial.getValue(scope))
      : setter

    forEntries(this._fields, (field, key) => {
      if (hasProperty(setters, key) && !isUndefined(setters[key])) {
        field._setInput(scope, setters[key])
      }
    })
  }

  // E R R O R

  public readonly _error = Impulse(
    (scope) => {
      const error = mapValues(this._fields, ({ _error }) => {
        return _error.getValue(scope)
      })

      if (values(error).every(isNull)) {
        return null
      }

      return error as ImpulseFormShapeError<TFields>
    },
    {
      compare: isImpulseFormShapeErrorEqual,
    },
  )

  public readonly _errorVerbose = Impulse(
    (scope) => {
      const errorVerbose = mapValues(this._fields, ({ _errorVerbose }) => {
        return _errorVerbose.getValue(scope)
      })

      return errorVerbose as ImpulseFormShapeErrorVerbose<TFields>
    },

    {
      compare: isImpulseFormShapeErrorVerboseEqual,
    },
  )

  public _setError(
    scope: Scope,
    setter: ImpulseFormShapeErrorSetter<TFields>,
  ): void {
    const setters = isFunction(setter)
      ? setter(this._errorVerbose.getValue(scope))
      : setter

    forEntries(this._fields, (field, key) => {
      if (isNull(setters)) {
        field._setError(scope, setters)
      } else if (hasProperty(setters, key) && !isUndefined(setters[key])) {
        field._setError(scope, setters[key])
      }
    })
  }

  // V A L I D A T E   O N

  public readonly _validateOn = Impulse(
    (scope) => {
      const validateOn = mapValues(this._fields, ({ _validateOn }) => {
        return _validateOn.getValue(scope)
      })

      const allValidateOn = values(validateOn)

      /**
       * Fallback to onTouch if none string validateOn is present.
       * When the fields are empty it will use it.
       * When the fields are not empty and have any value different than it uses the fields.
       */
      const onlyValidateOn = allValidateOn.find(isString) ?? VALIDATE_ON_TOUCH

      for (const fieldValidateOn of allValidateOn) {
        if (fieldValidateOn !== onlyValidateOn) {
          return validateOn as ImpulseFormShapeValidateOn<TFields>
        }
      }

      return onlyValidateOn as ValidateStrategy
    },

    {
      compare: isImpulseFormShapeValidateOnEqual,
    },
  )

  public readonly _validateOnVerbose = Impulse(
    (scope) => {
      const validateOnVerbose = mapValues(
        this._fields,
        ({ _validateOnVerbose }) => _validateOnVerbose.getValue(scope),
      )

      return validateOnVerbose as ImpulseFormShapeValidateOnVerbose<TFields>
    },

    {
      compare: isImpulseFormShapeValidateOnVerboseEqual,
    },
  )

  public _setValidateOn(
    scope: Scope,
    setter: ImpulseFormShapeValidateOnSetter<TFields>,
  ): void {
    const setters = isFunction(setter)
      ? setter(this._validateOnVerbose.getValue(scope))
      : setter

    forEntries(this._fields, (field, key) => {
      if (isString(setters)) {
        field._setValidateOn(scope, setters)
      } else if (hasProperty(setters, key) && !isUndefined(setters[key])) {
        field._setValidateOn(scope, setters[key])
      }
    })
  }

  // T O U C H E D

  public readonly _touched = Impulse(
    (scope) => {
      const touched = mapValues(this._fields, ({ _touched }) => {
        return _touched.getValue(scope)
      })

      const allTouched = values(touched)
      const onlyTouched = allTouched.find(isBoolean) ?? false

      for (const fieldTouched of allTouched) {
        if (fieldTouched !== onlyTouched) {
          return touched as ImpulseFormShapeFlag<TFields>
        }
      }

      return onlyTouched
    },

    {
      compare: isImpulseFormShapeFlagEqual,
    },
  )

  public readonly _touchedVerbose = Impulse(
    (scope) => {
      const touchedVerbose = mapValues(this._fields, ({ _touchedVerbose }) =>
        _touchedVerbose.getValue(scope),
      )

      return touchedVerbose as ImpulseFormShapeFlagVerbose<TFields>
    },

    {
      compare: isImpulseFormShapeFlagVerboseEqual,
    },
  )

  public _setTouched(
    scope: Scope,
    setter: ImpulseFormShapeFlagSetter<TFields>,
  ): void {
    const setters = isFunction(setter)
      ? setter(this._touchedVerbose.getValue(scope))
      : setter

    forEntries(this._fields, (field, key) => {
      if (isBoolean(setters)) {
        field._setTouched(scope, setters)
      } else if (hasProperty(setters, key) && !isUndefined(setters[key])) {
        field._setTouched(scope, setters[key])
      }
    })
  }

  // O U T P U T

  public readonly _output = Impulse(
    (scope) => {
      const output = mapValues(this._fields, ({ _output }) => {
        return _output.getValue(scope)
      })

      if (values(output).some(isNull)) {
        return null
      }

      return {
        ...output,
        ...this._constants,
      } as ImpulseFormShapeOutput<TFields>
    },
    {
      compare: isImpulseFormShapeOutputEqual,
    },
  )

  public readonly _outputVerbose = Impulse(
    (scope) => {
      const outputVerbose = mapValues(this._fields, ({ _outputVerbose }) => {
        return _outputVerbose.getValue(scope)
      })

      return {
        ...outputVerbose,
        ...this._constants,
      } as ImpulseFormShapeOutputVerbose<TFields>
    },
    {
      compare: isImpulseFormShapeOutputVerboseEqual,
    },
  )

  // V A L I D

  public readonly _valid = Impulse(
    (scope) => {
      const valid = mapValues(this._fields, ({ _valid }) => {
        return _valid.getValue(scope)
      })

      const allValid = values(valid)
      const onlyValid = allValid.find(isBoolean) ?? false

      for (const fieldValid of allValid) {
        if (fieldValid !== onlyValid) {
          return valid as ImpulseFormShapeFlag<TFields>
        }
      }

      return onlyValid
    },

    {
      compare: isImpulseFormShapeFlagEqual,
    },
  )

  public readonly _validVerbose = Impulse(
    (scope) => {
      const validVerbose = mapValues(this._fields, ({ _validVerbose }) =>
        _validVerbose.getValue(scope),
      )

      return validVerbose as ImpulseFormShapeFlagVerbose<TFields>
    },

    {
      compare: isImpulseFormShapeFlagVerboseEqual,
    },
  )

  // I N V A L I D

  public readonly _invalid = Impulse(
    (scope) => {
      const invalid = mapValues(this._fields, ({ _invalid }) => {
        return _invalid.getValue(scope)
      })

      const allInvalid = values(invalid)
      const onlyInvalid = allInvalid.find(isBoolean) ?? false

      for (const fieldInvalid of allInvalid) {
        if (fieldInvalid !== onlyInvalid) {
          return invalid as ImpulseFormShapeFlag<TFields>
        }
      }

      return onlyInvalid
    },

    {
      compare: isImpulseFormShapeFlagEqual,
    },
  )

  public readonly _invalidVerbose = Impulse(
    (scope) => {
      const invalidVerbose = mapValues(this._fields, ({ _invalidVerbose }) => {
        return _invalidVerbose.getValue(scope)
      })

      return invalidVerbose as ImpulseFormShapeFlagVerbose<TFields>
    },

    {
      compare: isImpulseFormShapeFlagVerboseEqual,
    },
  )

  // V A L I D A T E D

  public readonly _validated = Impulse(
    (scope) => {
      const validated = mapValues(this._fields, ({ _validated }) => {
        return _validated.getValue(scope)
      })

      const allValidated = values(validated)
      const onlyValidated = allValidated.find(isBoolean) ?? false

      for (const fieldValidated of allValidated) {
        if (fieldValidated !== onlyValidated) {
          return validated as ImpulseFormShapeFlag<TFields>
        }
      }

      return onlyValidated
    },

    {
      compare: isImpulseFormShapeFlagEqual,
    },
  )

  public readonly _validatedVerbose = Impulse(
    (scope) => {
      const validatedVerbose = mapValues(
        this._fields,
        ({ _validatedVerbose }) => _validatedVerbose.getValue(scope),
      )

      return validatedVerbose as ImpulseFormShapeFlagVerbose<TFields>
    },

    {
      compare: isImpulseFormShapeFlagVerboseEqual,
    },
  )

  public _forceValidated(scope: Scope): void {
    forEntries(this._fields, (field) => {
      field._forceValidated(scope)
    })
  }

  // D I R T Y

  public readonly _dirty = Impulse(
    (scope) => {
      const dirty = mapValues(this._fields, ({ _dirty }) => {
        return _dirty.getValue(scope)
      })

      const allDirty = values(dirty)
      const onlyDirty = allDirty.find(isBoolean) ?? false

      for (const fieldDirty of allDirty) {
        if (fieldDirty !== onlyDirty) {
          return dirty as ImpulseFormShapeFlag<TFields>
        }
      }

      return onlyDirty
    },

    {
      compare: isImpulseFormShapeFlagEqual,
    },
  )

  public readonly _dirtyVerbose = Impulse(
    (scope) => {
      const dirtyVerbose = mapValues(this._fields, ({ _dirtyVerbose }) => {
        return _dirtyVerbose.getValue(scope)
      })

      return dirtyVerbose as ImpulseFormShapeFlagVerbose<TFields>
    },

    {
      compare: isImpulseFormShapeFlagVerboseEqual,
    },
  )

  // R E S E T

  public _reset(
    scope: Scope,
    resetter: undefined | ImpulseFormShapeInputSetter<TFields>,
  ): void {
    const resetters = isFunction(resetter)
      ? resetter(this._initial.getValue(scope), this._input.getValue(scope))
      : resetter

    forEntries(this._fields, (field, key) => {
      field._reset(
        scope,
        hasProperty(resetters, key) ? resetters[key] : undefined,
      )
    })
  }

  // C H I L D R E N

  public _getChildren<TChildParams extends ImpulseFormParams>(): ReadonlyArray<
    ImpulseFormChild<TChildParams, ImpulseFormShapeParams<TFields>>
  > {
    return entries(this._fields).map(([key, field]) => ({
      _state: field,
      _mapToChild: (output) => output[key],
    }))
  }
}
