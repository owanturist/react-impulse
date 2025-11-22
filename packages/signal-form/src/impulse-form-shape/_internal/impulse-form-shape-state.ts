import { Impulse, type Scope } from "@owanturist/signal"

import { entries } from "~/tools/entries"
import { hasProperty } from "~/tools/has-property"
import { isBoolean } from "~/tools/is-boolean"
import { isFunction } from "~/tools/is-function"
import { isNull } from "~/tools/is-null"
import { isString } from "~/tools/is-string"
import { isUndefined } from "~/tools/is-undefined"
import { Lazy } from "~/tools/lazy"
import { map } from "~/tools/map"
import { mapValues } from "~/tools/map-values"
import type { OmitValues } from "~/tools/omit-values"
import { values } from "~/tools/values"

import { toConcise } from "../../_internal/to-concise"
import {
  type ImpulseFormChild,
  ImpulseFormState,
} from "../../impulse-form/_internal/impulse-form-state"
import type { ImpulseForm } from "../../impulse-form/impulse-form"
import type { ImpulseFormParams } from "../../impulse-form/impulse-form-params"
import { VALIDATE_ON_TOUCH, type ValidateStrategy } from "../../validate-strategy"
import type { ImpulseFormShapeError } from "../impulse-form-shape-error"
import type { ImpulseFormShapeErrorSetter } from "../impulse-form-shape-error-setter"
import type { ImpulseFormShapeErrorVerbose } from "../impulse-form-shape-error-verbose"
import type { ImpulseFormShapeFields } from "../impulse-form-shape-fields"
import type { ImpulseFormShapeFlag } from "../impulse-form-shape-flag"
import type { ImpulseFormShapeFlagSetter } from "../impulse-form-shape-flag-setter"
import type { ImpulseFormShapeFlagVerbose } from "../impulse-form-shape-flag-verbose"
import type { ImpulseFormShapeInput } from "../impulse-form-shape-input"
import type { ImpulseFormShapeInputSetter } from "../impulse-form-shape-input-setter"
import type { ImpulseFormShapeOutput } from "../impulse-form-shape-output"
import type { ImpulseFormShapeOutputVerbose } from "../impulse-form-shape-output-verbose"
import type { ImpulseFormShapeParams } from "../impulse-form-shape-params"
import type { ImpulseFormShapeValidateOn } from "../impulse-form-shape-validate-on"
import type { ImpulseFormShapeValidateOnSetter } from "../impulse-form-shape-validate-on-setter"
import type { ImpulseFormShapeValidateOnVerbose } from "../impulse-form-shape-validate-on-verbose"

import { ImpulseFormShape } from "./impulse-form-shape"

type ImpulseFormShapeStateFields<TFields extends ImpulseFormShapeFields> = OmitValues<
  {
    [TField in keyof TFields]: TFields[TField] extends ImpulseForm<infer TParams>
      ? ImpulseFormState<TParams>
      : never
  },
  never
>

type ImpulseFormShapeStateMeta<TFields extends ImpulseFormShapeFields> = OmitValues<
  {
    [TField in keyof TFields]: TFields[TField] extends ImpulseForm
      ? never
      : Impulse<TFields[TField]>
  },
  never
>

class ImpulseFormShapeState<
  TFields extends ImpulseFormShapeFields = ImpulseFormShapeFields,
> extends ImpulseFormState<ImpulseFormShapeParams<TFields>> {
  public readonly _host = Lazy(() => new ImpulseFormShape(this))

  public readonly _fields: ImpulseFormShapeStateFields<TFields>

  public readonly _meta: ImpulseFormShapeStateMeta<TFields>

  public constructor(
    parent: null | ImpulseFormState,
    fields: ImpulseFormShapeStateFields<TFields>,
    meta: ImpulseFormShapeStateMeta<TFields>,
  ) {
    super(parent)

    this._fields = mapValues(fields, (field) => this._parentOf(field))
    this._meta = mapValues(meta, (field) =>
      field.clone(),
    ) as unknown as ImpulseFormShapeStateMeta<TFields>
  }

  public _childOf(parent: null | ImpulseFormState): ImpulseFormShapeState<TFields> {
    return new ImpulseFormShapeState(parent, this._fields, this._meta)
  }

  // I N I T I A L

  public readonly _initial = Impulse((scope): ImpulseFormShapeInput<TFields> => {
    const initial = mapValues(this._fields, ({ _initial }) => _initial.getValue(scope))

    const meta = mapValues(this._meta, (field) => field.getValue(scope))

    return { ...initial, ...meta } as ImpulseFormShapeInput<TFields>
  })

  public _replaceInitial(
    scope: Scope,
    state: undefined | ImpulseFormShapeState<TFields>,
    isMounting: boolean,
  ): void {
    for (const [key, field] of entries(this._fields)) {
      field._replaceInitial(scope, state?._fields[key], isMounting)
    }
  }

  public _setInitial(scope: Scope, setter: ImpulseFormShapeInputSetter<TFields>): void {
    const setters = isFunction(setter)
      ? setter(this._initial.getValue(scope), this._input.getValue(scope))
      : setter

    for (const [key, field] of entries(this._fields)) {
      if (hasProperty(setters, key) && !isUndefined(setters[key])) {
        field._setInitial(scope, setters[key])
      }
    }

    for (const [key, field] of entries(this._meta)) {
      if (hasProperty(setters, key) && !isUndefined(setters[key])) {
        field.setValue(setters[key] as TFields[typeof key])
      }
    }
  }

  // I N P U T

  public readonly _input = Impulse((scope): ImpulseFormShapeInput<TFields> => {
    const input = mapValues(this._fields, ({ _input }) => _input.getValue(scope))

    const meta = mapValues(this._meta, (field) => field.getValue(scope))

    return { ...input, ...meta } as ImpulseFormShapeInput<TFields>
  })

  public _setInput(scope: Scope, setter: ImpulseFormShapeInputSetter<TFields>): void {
    const setters = isFunction(setter)
      ? setter(this._input.getValue(scope), this._initial.getValue(scope))
      : setter

    for (const [key, field] of entries(this._fields)) {
      if (hasProperty(setters, key) && !isUndefined(setters[key])) {
        field._setInput(scope, setters[key])
      }
    }
  }

  // E R R O R

  public readonly _error = Impulse((scope): ImpulseFormShapeError<TFields> => {
    const error = mapValues(this._fields, ({ _error }) => _error.getValue(scope))

    if (values(error).every(isNull)) {
      return null
    }

    return error as ImpulseFormShapeError<TFields>
  })

  public readonly _errorVerbose = Impulse((scope): ImpulseFormShapeErrorVerbose<TFields> => {
    const errorVerbose = mapValues(this._fields, ({ _errorVerbose }) =>
      _errorVerbose.getValue(scope),
    )

    return errorVerbose as ImpulseFormShapeErrorVerbose<TFields>
  })

  public _setError(scope: Scope, setter: ImpulseFormShapeErrorSetter<TFields>): void {
    const setters = isFunction(setter) ? setter(this._errorVerbose.getValue(scope)) : setter

    for (const [key, field] of entries(this._fields)) {
      if (isNull(setters)) {
        field._setError(scope, setters)
      } else if (hasProperty(setters, key) && !isUndefined(setters[key])) {
        field._setError(scope, setters[key])
      }
    }
  }

  // V A L I D A T E   O N

  public readonly _validateOn = Impulse((scope): ImpulseFormShapeValidateOn<TFields> => {
    const validateOn = mapValues(this._fields, ({ _validateOn }) => _validateOn.getValue(scope))

    return toConcise(
      values(validateOn),
      isString as (input: unknown) => input is ValidateStrategy,
      VALIDATE_ON_TOUCH,
      validateOn as ImpulseFormShapeValidateOn<TFields>,
    )
  })

  public readonly _validateOnVerbose = Impulse(
    (scope): ImpulseFormShapeValidateOnVerbose<TFields> => {
      const validateOnVerbose = mapValues(this._fields, ({ _validateOnVerbose }) =>
        _validateOnVerbose.getValue(scope),
      )

      return validateOnVerbose as ImpulseFormShapeValidateOnVerbose<TFields>
    },
  )

  public _setValidateOn(scope: Scope, setter: ImpulseFormShapeValidateOnSetter<TFields>): void {
    const setters = isFunction(setter) ? setter(this._validateOnVerbose.getValue(scope)) : setter

    for (const [key, field] of entries(this._fields)) {
      if (isString(setters)) {
        field._setValidateOn(scope, setters)
      } else if (hasProperty(setters, key) && !isUndefined(setters[key])) {
        field._setValidateOn(scope, setters[key])
      }
    }
  }

  // T O U C H E D

  public readonly _touched = Impulse((scope): ImpulseFormShapeFlag<TFields> => {
    const touched = mapValues(this._fields, ({ _touched }) => _touched.getValue(scope))

    return toConcise(values(touched), isBoolean, false, touched as ImpulseFormShapeFlag<TFields>)
  })

  public readonly _touchedVerbose = Impulse((scope): ImpulseFormShapeFlagVerbose<TFields> => {
    const touchedVerbose = mapValues(this._fields, ({ _touchedVerbose }) =>
      _touchedVerbose.getValue(scope),
    )

    return touchedVerbose as ImpulseFormShapeFlagVerbose<TFields>
  })

  public _setTouched(scope: Scope, setter: ImpulseFormShapeFlagSetter<TFields>): void {
    const setters = isFunction(setter) ? setter(this._touchedVerbose.getValue(scope)) : setter

    for (const [key, field] of entries(this._fields)) {
      if (isBoolean(setters)) {
        field._setTouched(scope, setters)
      } else if (hasProperty(setters, key) && !isUndefined(setters[key])) {
        field._setTouched(scope, setters[key])
      }
    }
  }

  // O U T P U T

  public readonly _output = Impulse((scope): null | ImpulseFormShapeOutput<TFields> => {
    const output = mapValues(this._fields, ({ _output }) => _output.getValue(scope))

    if (values(output).some(isNull)) {
      return null
    }

    const meta = mapValues(this._meta, (field) => field.getValue(scope))

    return { ...output, ...meta } as ImpulseFormShapeOutput<TFields>
  })

  public readonly _outputVerbose = Impulse((scope): ImpulseFormShapeOutputVerbose<TFields> => {
    const outputVerbose = mapValues(this._fields, ({ _outputVerbose }) =>
      _outputVerbose.getValue(scope),
    )

    const meta = mapValues(this._meta, (field) => field.getValue(scope))

    return {
      ...outputVerbose,
      ...meta,
    } as ImpulseFormShapeOutputVerbose<TFields>
  })

  // V A L I D

  public readonly _valid = Impulse((scope): ImpulseFormShapeFlag<TFields> => {
    const valid = mapValues(this._fields, ({ _valid }) => _valid.getValue(scope))

    return toConcise(values(valid), isBoolean, false, valid as ImpulseFormShapeFlag<TFields>)
  })

  public readonly _validVerbose = Impulse((scope): ImpulseFormShapeFlagVerbose<TFields> => {
    const validVerbose = mapValues(this._fields, ({ _validVerbose }) =>
      _validVerbose.getValue(scope),
    )

    return validVerbose as ImpulseFormShapeFlagVerbose<TFields>
  })

  // I N V A L I D

  public readonly _invalid = Impulse((scope): ImpulseFormShapeFlag<TFields> => {
    const invalid = mapValues(this._fields, ({ _invalid }) => _invalid.getValue(scope))

    return toConcise(values(invalid), isBoolean, false, invalid as ImpulseFormShapeFlag<TFields>)
  })

  public readonly _invalidVerbose = Impulse((scope): ImpulseFormShapeFlagVerbose<TFields> => {
    const invalidVerbose = mapValues(this._fields, ({ _invalidVerbose }) =>
      _invalidVerbose.getValue(scope),
    )

    return invalidVerbose as ImpulseFormShapeFlagVerbose<TFields>
  })

  // V A L I D A T E D

  public readonly _validated = Impulse((scope): ImpulseFormShapeFlag<TFields> => {
    const validated = mapValues(this._fields, ({ _validated }) => _validated.getValue(scope))

    return toConcise(
      values(validated),
      isBoolean,
      false,
      validated as ImpulseFormShapeFlag<TFields>,
    )
  })

  public readonly _validatedVerbose = Impulse((scope): ImpulseFormShapeFlagVerbose<TFields> => {
    const validatedVerbose = mapValues(this._fields, ({ _validatedVerbose }) =>
      _validatedVerbose.getValue(scope),
    )

    return validatedVerbose as ImpulseFormShapeFlagVerbose<TFields>
  })

  public _forceValidated(scope: Scope): void {
    for (const field of values(this._fields)) {
      field._forceValidated(scope)
    }
  }

  // D I R T Y

  public readonly _dirty = Impulse((scope): ImpulseFormShapeFlag<TFields> => {
    const dirty = mapValues(this._fields, ({ _dirty }) => _dirty.getValue(scope))

    return toConcise(values(dirty), isBoolean, false, dirty as ImpulseFormShapeFlag<TFields>)
  })

  public readonly _dirtyVerbose = Impulse((scope): ImpulseFormShapeFlagVerbose<TFields> => {
    const dirtyVerbose = mapValues(this._fields, ({ _dirtyVerbose }) =>
      _dirtyVerbose.getValue(scope),
    )

    return dirtyVerbose as ImpulseFormShapeFlagVerbose<TFields>
  })

  public readonly _dirtyOn = Impulse((scope): ImpulseFormShapeFlag<TFields> => {
    const dirtyOn = mapValues(this._fields, ({ _dirtyOn }) => _dirtyOn.getValue(scope))

    return toConcise(values(dirtyOn), isBoolean, false, dirtyOn as ImpulseFormShapeFlag<TFields>)
  })

  public readonly _dirtyOnVerbose = Impulse((scope): ImpulseFormShapeFlagVerbose<TFields> => {
    const dirtyOnVerbose = mapValues(this._fields, ({ _dirtyOnVerbose }) =>
      _dirtyOnVerbose.getValue(scope),
    )

    return dirtyOnVerbose as ImpulseFormShapeFlagVerbose<TFields>
  })

  // R E S E T

  public _reset(scope: Scope, resetter: undefined | ImpulseFormShapeInputSetter<TFields>): void {
    if (!isUndefined(resetter)) {
      this._setInitial(scope, resetter)
    }

    for (const field of values(this._fields)) {
      field._reset(scope, undefined)
    }
  }

  // C H I L D R E N

  public _getChildren<TChildParams extends ImpulseFormParams>(): ReadonlyArray<
    ImpulseFormChild<TChildParams, ImpulseFormShapeParams<TFields>>
  > {
    return map(entries(this._fields), ([key, field]) => ({
      _state: field as unknown as ImpulseFormState<TChildParams>,
      _mapToChild: (output) => output[key as keyof ImpulseFormShapeOutput<TFields>],
    }))
  }
}

export type { ImpulseFormShapeStateFields, ImpulseFormShapeStateMeta }
export { ImpulseFormShapeState }
