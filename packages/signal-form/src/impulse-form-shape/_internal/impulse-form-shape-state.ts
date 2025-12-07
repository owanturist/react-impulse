import { Impulse, type Monitor } from "@owanturist/signal"

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

  public readonly _initial = Impulse((monitor): ImpulseFormShapeInput<TFields> => {
    const initial = mapValues(this._fields, ({ _initial }) => _initial.read(monitor))

    const meta = mapValues(this._meta, (field) => field.read(monitor))

    return { ...initial, ...meta } as ImpulseFormShapeInput<TFields>
  })

  public _replaceInitial(
    monitor: Monitor,
    state: undefined | ImpulseFormShapeState<TFields>,
    isMounting: boolean,
  ): void {
    for (const [key, field] of entries(this._fields)) {
      field._replaceInitial(monitor, state?._fields[key], isMounting)
    }
  }

  public _setInitial(monitor: Monitor, setter: ImpulseFormShapeInputSetter<TFields>): void {
    const setters = isFunction(setter)
      ? setter(this._initial.read(monitor), this._input.read(monitor))
      : setter

    for (const [key, field] of entries(this._fields)) {
      if (hasProperty(setters, key) && !isUndefined(setters[key])) {
        field._setInitial(monitor, setters[key])
      }
    }

    for (const [key, field] of entries(this._meta)) {
      if (hasProperty(setters, key) && !isUndefined(setters[key])) {
        field.update(setters[key] as TFields[typeof key])
      }
    }
  }

  // I N P U T

  public readonly _input = Impulse((monitor): ImpulseFormShapeInput<TFields> => {
    const input = mapValues(this._fields, ({ _input }) => _input.read(monitor))

    const meta = mapValues(this._meta, (field) => field.read(monitor))

    return { ...input, ...meta } as ImpulseFormShapeInput<TFields>
  })

  public _setInput(monitor: Monitor, setter: ImpulseFormShapeInputSetter<TFields>): void {
    const setters = isFunction(setter)
      ? setter(this._input.read(monitor), this._initial.read(monitor))
      : setter

    for (const [key, field] of entries(this._fields)) {
      if (hasProperty(setters, key) && !isUndefined(setters[key])) {
        field._setInput(monitor, setters[key])
      }
    }
  }

  // E R R O R

  public readonly _error = Impulse((monitor): ImpulseFormShapeError<TFields> => {
    const error = mapValues(this._fields, ({ _error }) => _error.read(monitor))

    if (values(error).every(isNull)) {
      return null
    }

    return error as ImpulseFormShapeError<TFields>
  })

  public readonly _errorVerbose = Impulse((monitor): ImpulseFormShapeErrorVerbose<TFields> => {
    const errorVerbose = mapValues(this._fields, ({ _errorVerbose }) => _errorVerbose.read(monitor))

    return errorVerbose as ImpulseFormShapeErrorVerbose<TFields>
  })

  public _setError(monitor: Monitor, setter: ImpulseFormShapeErrorSetter<TFields>): void {
    const setters = isFunction(setter) ? setter(this._errorVerbose.read(monitor)) : setter

    for (const [key, field] of entries(this._fields)) {
      if (isNull(setters)) {
        field._setError(monitor, setters)
      } else if (hasProperty(setters, key) && !isUndefined(setters[key])) {
        field._setError(monitor, setters[key])
      }
    }
  }

  // V A L I D A T E   O N

  public readonly _validateOn = Impulse((monitor): ImpulseFormShapeValidateOn<TFields> => {
    const validateOn = mapValues(this._fields, ({ _validateOn }) => _validateOn.read(monitor))

    return toConcise(
      values(validateOn),
      isString as (input: unknown) => input is ValidateStrategy,
      VALIDATE_ON_TOUCH,
      validateOn as ImpulseFormShapeValidateOn<TFields>,
    )
  })

  public readonly _validateOnVerbose = Impulse(
    (monitor): ImpulseFormShapeValidateOnVerbose<TFields> => {
      const validateOnVerbose = mapValues(this._fields, ({ _validateOnVerbose }) =>
        _validateOnVerbose.read(monitor),
      )

      return validateOnVerbose as ImpulseFormShapeValidateOnVerbose<TFields>
    },
  )

  public _setValidateOn(monitor: Monitor, setter: ImpulseFormShapeValidateOnSetter<TFields>): void {
    const setters = isFunction(setter) ? setter(this._validateOnVerbose.read(monitor)) : setter

    for (const [key, field] of entries(this._fields)) {
      if (isString(setters)) {
        field._setValidateOn(monitor, setters)
      } else if (hasProperty(setters, key) && !isUndefined(setters[key])) {
        field._setValidateOn(monitor, setters[key])
      }
    }
  }

  // T O U C H E D

  public readonly _touched = Impulse((monitor): ImpulseFormShapeFlag<TFields> => {
    const touched = mapValues(this._fields, ({ _touched }) => _touched.read(monitor))

    return toConcise(values(touched), isBoolean, false, touched as ImpulseFormShapeFlag<TFields>)
  })

  public readonly _touchedVerbose = Impulse((monitor): ImpulseFormShapeFlagVerbose<TFields> => {
    const touchedVerbose = mapValues(this._fields, ({ _touchedVerbose }) =>
      _touchedVerbose.read(monitor),
    )

    return touchedVerbose as ImpulseFormShapeFlagVerbose<TFields>
  })

  public _setTouched(monitor: Monitor, setter: ImpulseFormShapeFlagSetter<TFields>): void {
    const setters = isFunction(setter) ? setter(this._touchedVerbose.read(monitor)) : setter

    for (const [key, field] of entries(this._fields)) {
      if (isBoolean(setters)) {
        field._setTouched(monitor, setters)
      } else if (hasProperty(setters, key) && !isUndefined(setters[key])) {
        field._setTouched(monitor, setters[key])
      }
    }
  }

  // O U T P U T

  public readonly _output = Impulse((monitor): null | ImpulseFormShapeOutput<TFields> => {
    const output = mapValues(this._fields, ({ _output }) => _output.read(monitor))

    if (values(output).some(isNull)) {
      return null
    }

    const meta = mapValues(this._meta, (field) => field.read(monitor))

    return { ...output, ...meta } as ImpulseFormShapeOutput<TFields>
  })

  public readonly _outputVerbose = Impulse((monitor): ImpulseFormShapeOutputVerbose<TFields> => {
    const outputVerbose = mapValues(this._fields, ({ _outputVerbose }) =>
      _outputVerbose.read(monitor),
    )

    const meta = mapValues(this._meta, (field) => field.read(monitor))

    return {
      ...outputVerbose,
      ...meta,
    } as ImpulseFormShapeOutputVerbose<TFields>
  })

  // V A L I D

  public readonly _valid = Impulse((monitor): ImpulseFormShapeFlag<TFields> => {
    const valid = mapValues(this._fields, ({ _valid }) => _valid.read(monitor))

    return toConcise(values(valid), isBoolean, false, valid as ImpulseFormShapeFlag<TFields>)
  })

  public readonly _validVerbose = Impulse((monitor): ImpulseFormShapeFlagVerbose<TFields> => {
    const validVerbose = mapValues(this._fields, ({ _validVerbose }) => _validVerbose.read(monitor))

    return validVerbose as ImpulseFormShapeFlagVerbose<TFields>
  })

  // I N V A L I D

  public readonly _invalid = Impulse((monitor): ImpulseFormShapeFlag<TFields> => {
    const invalid = mapValues(this._fields, ({ _invalid }) => _invalid.read(monitor))

    return toConcise(values(invalid), isBoolean, false, invalid as ImpulseFormShapeFlag<TFields>)
  })

  public readonly _invalidVerbose = Impulse((monitor): ImpulseFormShapeFlagVerbose<TFields> => {
    const invalidVerbose = mapValues(this._fields, ({ _invalidVerbose }) =>
      _invalidVerbose.read(monitor),
    )

    return invalidVerbose as ImpulseFormShapeFlagVerbose<TFields>
  })

  // V A L I D A T E D

  public readonly _validated = Impulse((monitor): ImpulseFormShapeFlag<TFields> => {
    const validated = mapValues(this._fields, ({ _validated }) => _validated.read(monitor))

    return toConcise(
      values(validated),
      isBoolean,
      false,
      validated as ImpulseFormShapeFlag<TFields>,
    )
  })

  public readonly _validatedVerbose = Impulse((monitor): ImpulseFormShapeFlagVerbose<TFields> => {
    const validatedVerbose = mapValues(this._fields, ({ _validatedVerbose }) =>
      _validatedVerbose.read(monitor),
    )

    return validatedVerbose as ImpulseFormShapeFlagVerbose<TFields>
  })

  public _forceValidated(monitor: Monitor): void {
    for (const field of values(this._fields)) {
      field._forceValidated(monitor)
    }
  }

  // D I R T Y

  public readonly _dirty = Impulse((monitor): ImpulseFormShapeFlag<TFields> => {
    const dirty = mapValues(this._fields, ({ _dirty }) => _dirty.read(monitor))

    return toConcise(values(dirty), isBoolean, false, dirty as ImpulseFormShapeFlag<TFields>)
  })

  public readonly _dirtyVerbose = Impulse((monitor): ImpulseFormShapeFlagVerbose<TFields> => {
    const dirtyVerbose = mapValues(this._fields, ({ _dirtyVerbose }) => _dirtyVerbose.read(monitor))

    return dirtyVerbose as ImpulseFormShapeFlagVerbose<TFields>
  })

  public readonly _dirtyOn = Impulse((monitor): ImpulseFormShapeFlag<TFields> => {
    const dirtyOn = mapValues(this._fields, ({ _dirtyOn }) => _dirtyOn.read(monitor))

    return toConcise(values(dirtyOn), isBoolean, false, dirtyOn as ImpulseFormShapeFlag<TFields>)
  })

  public readonly _dirtyOnVerbose = Impulse((monitor): ImpulseFormShapeFlagVerbose<TFields> => {
    const dirtyOnVerbose = mapValues(this._fields, ({ _dirtyOnVerbose }) =>
      _dirtyOnVerbose.read(monitor),
    )

    return dirtyOnVerbose as ImpulseFormShapeFlagVerbose<TFields>
  })

  // R E S E T

  public _reset(
    monitor: Monitor,
    resetter: undefined | ImpulseFormShapeInputSetter<TFields>,
  ): void {
    if (!isUndefined(resetter)) {
      this._setInitial(monitor, resetter)
    }

    for (const field of values(this._fields)) {
      field._reset(monitor, undefined)
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
