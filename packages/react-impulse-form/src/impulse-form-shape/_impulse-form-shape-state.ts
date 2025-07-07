import { entries } from "~/tools/entries"
import { forEntries } from "~/tools/for-entries"
import { hasProperty } from "~/tools/has-property"
import { isBoolean } from "~/tools/is-boolean"
import { isFunction } from "~/tools/is-function"
import { isNull } from "~/tools/is-null"
import { isString } from "~/tools/is-string"
import { isUndefined } from "~/tools/is-undefined"
import type { Lazy } from "~/tools/lazy"
import { mapValues } from "~/tools/map-values"
import type { OmitValues } from "~/tools/omit-values"
import { params } from "~/tools/params"
import { values } from "~/tools/values"

import { Impulse, batch } from "../dependencies"
import type { ImpulseForm } from "../impulse-form/impulse-form"
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
  public constructor(
    parent: undefined | Lazy<ImpulseFormState>,
    private readonly _fields: ImpulseFormShapeStateFields<TFields>,
    private readonly _constants: Omit<
      TFields,
      keyof ImpulseFormShapeStateFields<TFields>
    >,
  ) {
    super(parent)
  }

  public readonly _initial = Impulse(
    (scope) => {
      const initial = mapValues(this._fields, ({ _initial }) => {
        return _initial.getValue(scope)
      })

      return {
        ...initial,
        ...this._constants,
      } as ImpulseFormShapeInput<TFields>
    },

    {
      compare: isImpulseFormShapeInputEqual,
    },
  )

  public _setInitial(setter: ImpulseFormShapeInputSetter<TFields>): void {
    batch((scope) => {
      const setters = isFunction(setter)
        ? setter(this._initial.getValue(scope), this._input.getValue(scope))
        : setter

      forEntries(this._fields, (field, key) => {
        if (hasProperty(setters, key) && !isUndefined(setters[key])) {
          field._setInitial(setters[key])
        }
      })
    })
  }

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
    setter: ImpulseFormShapeInputSetter<TFields>,
    input: Lazy<ImpulseFormShapeInput<TFields>>,
    initial: Lazy<ImpulseFormShapeInput<TFields>>,
  ): void {
    const setters = isFunction(setter)
      ? setter(input._peek(), initial._peek())
      : setter

    forEntries(this._fields, (field, key) => {
      if (hasProperty(setters, key) && !isUndefined(setters[key])) {
        field._setInput(
          setters[key],
          input._map((fields) => fields[key]),
          initial._map((fields) => fields[key]),
        )
      }
    })
  }

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

  public _setError(setter: ImpulseFormShapeErrorSetter<TFields>): void {
    batch((scope) => {
      const setters = isFunction(setter)
        ? setter(this._errorVerbose.getValue(scope))
        : setter

      forEntries(this._fields, (field, key) => {
        if (isNull(setters)) {
          field._setError(setters)
        } else if (hasProperty(setters, key) && !isUndefined(setters[key])) {
          field._setError(setters[key])
        }
      })
    })
  }

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
    setter: ImpulseFormShapeValidateOnSetter<TFields>,
  ): void {
    batch((scope) => {
      const setters = isFunction(setter)
        ? setter(this._validateOnVerbose.getValue(scope))
        : setter

      forEntries(this._fields, (field, key) => {
        if (isString(setters)) {
          field._setValidateOn(setters)
        } else if (hasProperty(setters, key) && !isUndefined(setters[key])) {
          field._setValidateOn(setters[key])
        }
      })
    })
  }

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

  public _setTouched(setter: ImpulseFormShapeFlagSetter<TFields>): void {
    batch((scope) => {
      const setters = isFunction(setter)
        ? setter(this._touchedVerbose.getValue(scope))
        : setter

      forEntries(this._fields, (field, key) => {
        if (isBoolean(setters)) {
          field._setTouched(setters)
        } else if (hasProperty(setters, key) && !isUndefined(setters[key])) {
          field._setTouched(setters[key])
        }
      })
    })
  }

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

  public override _forceValidated(): void {
    batch(() => {
      forEntries(this._fields, (field) => {
        field._forceValidated()
      })
    })
  }

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

  public _reset(
    resetter: undefined | ImpulseFormShapeInputSetter<TFields>,
    initial: Lazy<ImpulseFormShapeInput<TFields>>,
    input: Lazy<ImpulseFormShapeInput<TFields>>,
  ): void {
    const resetters = isFunction(resetter)
      ? resetter(initial._peek(), input._peek())
      : resetter

    forEntries(this._fields, (field, key) => {
      field._reset(
        hasProperty(resetters, key) ? resetters[key] : params._first,
        initial._map((fields) => fields[key]),
        input._map((fields) => fields[key]),
      )
    })
  }

  public _getChildren(): ReadonlyArray<
    ImpulseFormChild<ImpulseFormShapeParams<TFields>>
  > {
    return entries(this._fields).map(([key, field]) => ({
      _state: field,
      _mapOutput: (output) => output[key],
    }))
  }
}
