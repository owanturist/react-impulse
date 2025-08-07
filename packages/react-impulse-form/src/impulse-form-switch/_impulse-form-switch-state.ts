import { entries } from "~/tools/entries"
import { hasProperty } from "~/tools/has-property"
import { isBoolean } from "~/tools/is-boolean"
import { isFunction } from "~/tools/is-function"
import { isNull } from "~/tools/is-null"
import { isTrue } from "~/tools/is-true"
import { isTruthy } from "~/tools/is-truthy"
import { isUndefined } from "~/tools/is-undefined"
import { keys } from "~/tools/keys"
import { Lazy } from "~/tools/lazy"
import { mapValues } from "~/tools/map-values"
import type { OmitValues } from "~/tools/omit-values"
import { params } from "~/tools/params"
import { values } from "~/tools/values"

import { Impulse, type Scope, batch } from "../dependencies"
import { type ImpulseForm, isImpulseForm } from "../impulse-form"
import type { GetImpulseFormParams } from "../impulse-form/get-impulse-form-params"
import { ImpulseFormState } from "../impulse-form/impulse-form-state"
import {
  ImpulseFormShape,
  type ImpulseFormShapeFields,
  isImpulseFormShapeFlagVerboseEqual,
} from "../impulse-form-shape"
import type {
  ImpulseFormShapeState,
  ImpulseFormShapeStateFields,
} from "../impulse-form-shape/_impulse-form-shape-state"
import { toConcise } from "../to-concise"

import { ImpulseFormSwitch } from "./_impulse-form-switch"
import type { ImpulseFormSwitchError } from "./_impulse-form-switch-error"
import type { ImpulseFormSwitchErrorSetter } from "./_impulse-form-switch-error-setter"
import type { ImpulseFormSwitchErrorVerbose } from "./_impulse-form-switch-error-verbose"
import {
  type ImpulseFormSwitchFlag,
  isImpulseFormSwitchFlagEqual,
} from "./_impulse-form-switch-flag"
import type { ImpulseFormSwitchFlagSetter } from "./_impulse-form-switch-flag-setter"
import {
  type ImpulseFormSwitchFlagVerbose,
  isImpulseFormSwitchFlagVerboseEqual,
} from "./_impulse-form-switch-flag-verbose"
import {
  type ImpulseFormSwitchInput,
  isImpulseFormSwitchInputEqual,
} from "./_impulse-form-switch-input"
import type { ImpulseFormSwitchInputSetter } from "./_impulse-form-switch-input-setter"
import type { ImpulseFormSwitchOutput } from "./_impulse-form-switch-output"
import type { ImpulseFormSwitchOutputVerbose } from "./_impulse-form-switch-output-verbose"
import type { ImpulseFormSwitchParams } from "./_impulse-form-switch-params"
import type { ImpulseFormSwitchValidateOn } from "./_impulse-form-switch-validate-on"
import type { ImpulseFormSwitchValidateOnSetter } from "./_impulse-form-switch-validate-on-setter"
import type { ImpulseFormSwitchValidateOnVerbose } from "./_impulse-form-switch-validate-on-verbose"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchStateBranches<
  TFields extends ImpulseFormShapeFields,
> = {
  [TField in keyof TFields]: ImpulseFormState<
    GetImpulseFormParams<TFields[TField]>
  >
}

export class ImpulseFormSwitchState<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> extends ImpulseFormState<ImpulseFormSwitchParams<TKind, TBranches>> {
  public readonly _host = Lazy(() => new ImpulseFormSwitch(this))

  public readonly _active: ImpulseFormState<GetImpulseFormParams<TKind>>
  public readonly _branches: ImpulseFormSwitchStateBranches<TBranches>

  public constructor(
    parent: null | ImpulseFormState,
    active: ImpulseFormState<GetImpulseFormParams<TKind>>,
    branches: ImpulseFormSwitchStateBranches<TBranches>,
  ) {
    super(parent)

    this._active = this._parentOf(active)
    this._branches = mapValues(branches, (branch) => this._parentOf(branch))
  }

  public _childOf(
    parent: null | ImpulseFormState,
  ): ImpulseFormSwitchState<TKind, TBranches> {
    return new ImpulseFormSwitchState(parent, this._active, this._branches)
  }

  // I N I T I A L

  public readonly _initial = Impulse(
    (scope): ImpulseFormSwitchInput<TKind, TBranches> => {
      const active = this._active._initial.getValue(scope)
      const branches = mapValues(this._branches, (branch) => {
        return branch._initial.getValue(scope)
      })

      return { active, branches }
    },

    {
      compare: isImpulseFormSwitchInputEqual,
    },
  )

  public _setInitial(
    scope: Scope,
    setter: ImpulseFormSwitchInputSetter<TKind, TBranches>,
  ): void {
    const initial = Lazy(() => this._initial.getValue(scope))
    const input = Lazy(() => this._input.getValue(scope))

    const { active, branches: branchesSetter } = isFunction(setter)
      ? setter(initial(), input())
      : setter

    if (!isUndefined(active)) {
      this._active._setInitial(scope, active)
    }

    const branches = isFunction(branchesSetter)
      ? branchesSetter(initial().branches, input().branches)
      : branchesSetter

    for (const [key, field] of entries(this._branches)) {
      if (hasProperty(branches, key) && !isUndefined(branches[key])) {
        field._setInitial(scope, branches[key])
      }
    }
  }

  public _replaceInitial(
    scope: Scope,
    state: undefined | ImpulseFormSwitchState<TKind, TBranches>,
    isMounting: boolean,
  ): void {
    this._active._replaceInitial(scope, state?._active, isMounting)

    for (const [key, branch] of entries(this._branches)) {
      branch._replaceInitial(scope, state?._branches[key], isMounting)
    }
  }

  // I N P U T

  public readonly _input = Impulse(
    (scope): ImpulseFormSwitchInput<TKind, TBranches> => {
      const active = this._active._input.getValue(scope)
      const branches = mapValues(this._branches, (branch) => {
        return branch._input.getValue(scope)
      })

      return { active, branches }
    },

    {
      compare: isImpulseFormSwitchInputEqual,
    },
  )

  public _setInput(
    scope: Scope,
    setter: ImpulseFormSwitchInputSetter<TKind, TBranches>,
  ): void {
    const initial = Lazy(() => this._initial.getValue(scope))
    const input = Lazy(() => this._input.getValue(scope))

    const { active, branches: branchesSetter } = isFunction(setter)
      ? setter(input(), initial())
      : setter

    if (!isUndefined(active)) {
      this._active._setInput(scope, active)
    }

    const branches = isFunction(branchesSetter)
      ? branchesSetter(input().branches, initial().branches)
      : branchesSetter

    for (const [key, field] of entries(this._branches)) {
      if (hasProperty(branches, key) && !isUndefined(branches[key])) {
        field._setInput(scope, branches[key])
      }
    }
  }

  // E R R O R

  public readonly _error = Impulse(
    (scope): ImpulseFormShapeError<TFields> => {
      const error = mapValues(this._fields, ({ _error }) => {
        return _error.getValue(scope)
      })

      if (values(error).every(isNull)) {
        return null
      }

      return error as ImpulseFormShapeError<TFields>
    },
    {
      // compare: isImpulseFormShapeErrorEqual,
    },
  )

  public readonly _errorVerbose = Impulse(
    (scope): ImpulseFormShapeErrorVerbose<TFields> => {
      const errorVerbose = mapValues(this._fields, ({ _errorVerbose }) => {
        return _errorVerbose.getValue(scope)
      })

      return errorVerbose as ImpulseFormShapeErrorVerbose<TFields>
    },

    {
      // compare: isImpulseFormShapeErrorVerboseEqual,
    },
  )

  public _setError(
    scope: Scope,
    setter: ImpulseFormShapeErrorSetter<TFields>,
  ): void {
    const setters = isFunction(setter)
      ? setter(this._errorVerbose.getValue(scope))
      : setter

    for (const [key, field] of entries(this._fields)) {
      if (isNull(setters)) {
        field._setError(scope, setters)
      } else if (hasProperty(setters, key) && !isUndefined(setters[key])) {
        field._setError(scope, setters[key])
      }
    }
  }

  // V A L I D A T E   O N

  public readonly _validateOn = Impulse(
    (scope): ImpulseFormShapeValidateOn<TFields> => {
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
      // compare: isImpulseFormShapeValidateOnEqual,
    },
  )

  public readonly _validateOnVerbose = Impulse(
    (scope): ImpulseFormShapeValidateOnVerbose<TFields> => {
      const validateOnVerbose = mapValues(
        this._fields,
        ({ _validateOnVerbose }) => _validateOnVerbose.getValue(scope),
      )

      return validateOnVerbose as ImpulseFormShapeValidateOnVerbose<TFields>
    },

    {
      // compare: isImpulseFormShapeValidateOnVerboseEqual,
    },
  )

  public _setValidateOn(
    scope: Scope,
    setter: ImpulseFormShapeValidateOnSetter<TFields>,
  ): void {
    const setters = isFunction(setter)
      ? setter(this._validateOnVerbose.getValue(scope))
      : setter

    for (const [key, field] of entries(this._fields)) {
      if (isString(setters)) {
        field._setValidateOn(scope, setters)
      } else if (hasProperty(setters, key) && !isUndefined(setters[key])) {
        field._setValidateOn(scope, setters[key])
      }
    }
  }

  // T O U C H E D

  public readonly _touched = Impulse(
    (scope): ImpulseFormShapeFlag<TFields> => {
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
      // compare: isImpulseFormShapeFlagEqual,
    },
  )

  public readonly _touchedVerbose = Impulse(
    (scope): ImpulseFormShapeFlagVerbose<TFields> => {
      const touchedVerbose = mapValues(this._fields, ({ _touchedVerbose }) =>
        _touchedVerbose.getValue(scope),
      )

      return touchedVerbose as ImpulseFormShapeFlagVerbose<TFields>
    },

    {
      // compare: isImpulseFormShapeFlagVerboseEqual,
    },
  )

  public _setTouched(
    scope: Scope,
    setter: ImpulseFormShapeFlagSetter<TFields>,
  ): void {
    const setters = isFunction(setter)
      ? setter(this._touchedVerbose.getValue(scope))
      : setter

    for (const [key, field] of entries(this._fields)) {
      if (isBoolean(setters)) {
        field._setTouched(scope, setters)
      } else if (hasProperty(setters, key) && !isUndefined(setters[key])) {
        field._setTouched(scope, setters[key])
      }
    }
  }

  // O U T P U T

  public readonly _output = Impulse(
    (scope): null | ImpulseFormShapeOutput<TFields> => {
      const output = mapValues(this._fields, ({ _output }) => {
        return _output.getValue(scope)
      })
      const meta = mapValues(this._meta, (field) => field.getValue(scope))

      if (values(output).some(isNull)) {
        return null
      }

      return { ...output, ...meta } as ImpulseFormShapeOutput<TFields>
    },
    {
      // compare: isImpulseFormShapeOutputEqual,
    },
  )

  public readonly _outputVerbose = Impulse(
    (scope): ImpulseFormShapeOutputVerbose<TFields> => {
      const outputVerbose = mapValues(this._fields, ({ _outputVerbose }) => {
        return _outputVerbose.getValue(scope)
      })

      const meta = mapValues(this._meta, (field) => {
        return field.getValue(scope)
      })

      return {
        ...outputVerbose,
        ...meta,
      } as ImpulseFormShapeOutputVerbose<TFields>
    },
    {
      // compare: isImpulseFormShapeOutputVerboseEqual,
    },
  )

  // V A L I D

  public readonly _valid = Impulse(
    (scope): ImpulseFormShapeFlag<TFields> => {
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
      // compare: isImpulseFormShapeFlagEqual,
    },
  )

  public readonly _validVerbose = Impulse(
    (scope): ImpulseFormShapeFlagVerbose<TFields> => {
      const validVerbose = mapValues(this._fields, ({ _validVerbose }) =>
        _validVerbose.getValue(scope),
      )

      return validVerbose as ImpulseFormShapeFlagVerbose<TFields>
    },

    {
      // compare: isImpulseFormShapeFlagVerboseEqual,
    },
  )

  // I N V A L I D

  public readonly _invalid = Impulse(
    (scope): ImpulseFormShapeFlag<TFields> => {
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
      // compare: isImpulseFormShapeFlagEqual,
    },
  )

  public readonly _invalidVerbose = Impulse(
    (scope): ImpulseFormShapeFlagVerbose<TFields> => {
      const invalidVerbose = mapValues(this._fields, ({ _invalidVerbose }) => {
        return _invalidVerbose.getValue(scope)
      })

      return invalidVerbose as ImpulseFormShapeFlagVerbose<TFields>
    },

    {
      // compare: isImpulseFormShapeFlagVerboseEqual,
    },
  )

  // V A L I D A T E D

  public readonly _validated = Impulse(
    (scope): ImpulseFormShapeFlag<TFields> => {
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
      // compare: isImpulseFormShapeFlagEqual,
    },
  )

  public readonly _validatedVerbose = Impulse(
    (scope): ImpulseFormShapeFlagVerbose<TFields> => {
      const validatedVerbose = mapValues(
        this._fields,
        ({ _validatedVerbose }) => _validatedVerbose.getValue(scope),
      )

      return validatedVerbose as ImpulseFormShapeFlagVerbose<TFields>
    },

    {
      // compare: isImpulseFormShapeFlagVerboseEqual,
    },
  )

  public _forceValidated(scope: Scope): void {
    for (const field of values(this._fields)) {
      field._forceValidated(scope)
    }
  }

  // D I R T Y

  public readonly _dirty = Impulse(
    (scope): ImpulseFormSwitchFlag<TKind, TBranches> => {
      const active = this._active._dirty.getValue(scope)
      const branches = mapValues(this._branches, ({ _dirty }) => {
        return _dirty.getValue(scope)
      })

      const conciseBranches = toConcise(
        values(branches),
        isBoolean,
        false,
        branches,
      )

      return toConcise([active, conciseBranches], isBoolean, false, {
        active,
        branches: conciseBranches,
      } as ImpulseFormSwitchFlag<TKind, TBranches>)
    },

    {
      compare: isImpulseFormSwitchFlagEqual,
    },
  )

  public readonly _dirtyVerbose = Impulse(
    (scope): ImpulseFormSwitchFlagVerbose<TKind, TBranches> => {
      const active = this._active._dirty.getValue(scope)
      const branches = mapValues(this._branches, ({ _dirtyVerbose }) => {
        return _dirtyVerbose.getValue(scope)
      })

      return { active, branches }
    },

    {
      compare: isImpulseFormSwitchFlagVerboseEqual,
    },
  )

  public readonly _dirtyOn = Impulse(
    (scope): ImpulseFormShapeFlag<TFields> => {
      const dirtyOn = mapValues(this._fields, ({ _dirtyOn }) => {
        return _dirtyOn.getValue(scope)
      })

      const allDirty = values(dirtyOn)
      const onlyDirty = allDirty.find(isBoolean) ?? false

      for (const fieldDirty of allDirty) {
        if (fieldDirty !== onlyDirty) {
          return dirtyOn as ImpulseFormShapeFlag<TFields>
        }
      }

      return onlyDirty
    },

    {
      // compare: isImpulseFormShapeFlagEqual,
    },
  )

  public readonly _dirtyOnVerbose = Impulse(
    (scope): ImpulseFormShapeFlagVerbose<TFields> => {
      const dirtyOnVerbose = mapValues(this._fields, ({ _dirtyOnVerbose }) => {
        return _dirtyOnVerbose.getValue(scope)
      })

      return dirtyOnVerbose as ImpulseFormShapeFlagVerbose<TFields>
    },

    {
      // compare: isImpulseFormShapeFlagVerboseEqual,
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

    for (const [key, field] of entries(this._fields)) {
      field._reset(
        scope,
        hasProperty(resetters, key) ? resetters[key] : undefined,
      )
    }
  }

  // C H I L D R E N

  public _getChildren<TChildParams extends ImpulseFormParams>(): ReadonlyArray<
    ImpulseFormChild<TChildParams, ImpulseFormShapeParams<TFields>>
  > {
    return map(entries(this._fields), ([key, field]) => ({
      _state: field as unknown as ImpulseFormState<TChildParams>,
      _mapToChild: (output) => {
        return output[key as keyof ImpulseFormShapeOutput<TFields>]
      },
    }))
  }
}
