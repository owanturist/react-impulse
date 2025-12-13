import { type Monitor, Signal } from "@owanturist/signal"

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
  type SignalFormChild,
  SignalFormState,
} from "../../impulse-form/_internal/impulse-form-state"
import type { SignalForm } from "../../impulse-form/impulse-form"
import type { SignalFormParams } from "../../impulse-form/impulse-form-params"
import { VALIDATE_ON_TOUCH, type ValidateStrategy } from "../../validate-strategy"
import type { FormShapeError } from "../impulse-form-shape-error"
import type { FormShapeErrorSetter } from "../impulse-form-shape-error-setter"
import type { FormShapeErrorVerbose } from "../impulse-form-shape-error-verbose"
import type { FormShapeFields } from "../impulse-form-shape-fields"
import type { FormShapeFlag } from "../impulse-form-shape-flag"
import type { FormShapeFlagSetter } from "../impulse-form-shape-flag-setter"
import type { FormShapeFlagVerbose } from "../impulse-form-shape-flag-verbose"
import type { FormShapeInput } from "../impulse-form-shape-input"
import type { FormShapeInputSetter } from "../impulse-form-shape-input-setter"
import type { FormShapeOutput } from "../impulse-form-shape-output"
import type { FormShapeOutputVerbose } from "../impulse-form-shape-output-verbose"
import type { FormShapeParams } from "../impulse-form-shape-params"
import type { FormShapeValidateOn } from "../impulse-form-shape-validate-on"
import type { FormShapeValidateOnSetter } from "../impulse-form-shape-validate-on-setter"
import type { FormShapeValidateOnVerbose } from "../impulse-form-shape-validate-on-verbose"

import { FormShape } from "./impulse-form-shape"

type FormShapeStateFields<TFields extends FormShapeFields> = OmitValues<
  {
    [TField in keyof TFields]: TFields[TField] extends SignalForm<infer TParams>
      ? SignalFormState<TParams>
      : never
  },
  never
>

type FormShapeStateMeta<TFields extends FormShapeFields> = OmitValues<
  {
    [TField in keyof TFields]: TFields[TField] extends SignalForm ? never : Signal<TFields[TField]>
  },
  never
>

class FormShapeState<TFields extends FormShapeFields = FormShapeFields> extends SignalFormState<
  FormShapeParams<TFields>
> {
  public readonly _host = Lazy(() => new FormShape(this))

  public readonly _fields: FormShapeStateFields<TFields>

  public readonly _meta: FormShapeStateMeta<TFields>

  public constructor(
    parent: null | SignalFormState,
    fields: FormShapeStateFields<TFields>,
    meta: FormShapeStateMeta<TFields>,
  ) {
    super(parent)

    this._fields = mapValues(fields, (field) => this._parentOf(field))
    this._meta = mapValues(meta, (field) => field.clone()) as unknown as FormShapeStateMeta<TFields>
  }

  public _childOf(parent: null | SignalFormState): FormShapeState<TFields> {
    return new FormShapeState(parent, this._fields, this._meta)
  }

  // I N I T I A L

  public readonly _initial = Signal((monitor): FormShapeInput<TFields> => {
    const initial = mapValues(this._fields, ({ _initial }) => _initial.read(monitor))

    const meta = mapValues(this._meta, (field) => field.read(monitor))

    return { ...initial, ...meta } as FormShapeInput<TFields>
  })

  public _replaceInitial(
    monitor: Monitor,
    state: undefined | FormShapeState<TFields>,
    isMounting: boolean,
  ): void {
    for (const [key, field] of entries(this._fields)) {
      field._replaceInitial(monitor, state?._fields[key], isMounting)
    }
  }

  public _setInitial(monitor: Monitor, setter: FormShapeInputSetter<TFields>): void {
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
        field.write(setters[key] as TFields[typeof key])
      }
    }
  }

  // I N P U T

  public readonly _input = Signal((monitor): FormShapeInput<TFields> => {
    const input = mapValues(this._fields, ({ _input }) => _input.read(monitor))

    const meta = mapValues(this._meta, (field) => field.read(monitor))

    return { ...input, ...meta } as FormShapeInput<TFields>
  })

  public _setInput(monitor: Monitor, setter: FormShapeInputSetter<TFields>): void {
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

  public readonly _error = Signal((monitor): FormShapeError<TFields> => {
    const error = mapValues(this._fields, ({ _error }) => _error.read(monitor))

    if (values(error).every(isNull)) {
      return null
    }

    return error as FormShapeError<TFields>
  })

  public readonly _errorVerbose = Signal((monitor): FormShapeErrorVerbose<TFields> => {
    const errorVerbose = mapValues(this._fields, ({ _errorVerbose }) => _errorVerbose.read(monitor))

    return errorVerbose as FormShapeErrorVerbose<TFields>
  })

  public _setError(monitor: Monitor, setter: FormShapeErrorSetter<TFields>): void {
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

  public readonly _validateOn = Signal((monitor): FormShapeValidateOn<TFields> => {
    const validateOn = mapValues(this._fields, ({ _validateOn }) => _validateOn.read(monitor))

    return toConcise(
      values(validateOn),
      isString as (input: unknown) => input is ValidateStrategy,
      VALIDATE_ON_TOUCH,
      validateOn as FormShapeValidateOn<TFields>,
    )
  })

  public readonly _validateOnVerbose = Signal((monitor): FormShapeValidateOnVerbose<TFields> => {
    const validateOnVerbose = mapValues(this._fields, ({ _validateOnVerbose }) =>
      _validateOnVerbose.read(monitor),
    )

    return validateOnVerbose as FormShapeValidateOnVerbose<TFields>
  })

  public _setValidateOn(monitor: Monitor, setter: FormShapeValidateOnSetter<TFields>): void {
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

  public readonly _touched = Signal((monitor): FormShapeFlag<TFields> => {
    const touched = mapValues(this._fields, ({ _touched }) => _touched.read(monitor))

    return toConcise(values(touched), isBoolean, false, touched as FormShapeFlag<TFields>)
  })

  public readonly _touchedVerbose = Signal((monitor): FormShapeFlagVerbose<TFields> => {
    const touchedVerbose = mapValues(this._fields, ({ _touchedVerbose }) =>
      _touchedVerbose.read(monitor),
    )

    return touchedVerbose as FormShapeFlagVerbose<TFields>
  })

  public _setTouched(monitor: Monitor, setter: FormShapeFlagSetter<TFields>): void {
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

  public readonly _output = Signal((monitor): null | FormShapeOutput<TFields> => {
    const output = mapValues(this._fields, ({ _output }) => _output.read(monitor))

    if (values(output).some(isNull)) {
      return null
    }

    const meta = mapValues(this._meta, (field) => field.read(monitor))

    return { ...output, ...meta } as FormShapeOutput<TFields>
  })

  public readonly _outputVerbose = Signal((monitor): FormShapeOutputVerbose<TFields> => {
    const outputVerbose = mapValues(this._fields, ({ _outputVerbose }) =>
      _outputVerbose.read(monitor),
    )

    const meta = mapValues(this._meta, (field) => field.read(monitor))

    return {
      ...outputVerbose,
      ...meta,
    } as FormShapeOutputVerbose<TFields>
  })

  // V A L I D

  public readonly _valid = Signal((monitor): FormShapeFlag<TFields> => {
    const valid = mapValues(this._fields, ({ _valid }) => _valid.read(monitor))

    return toConcise(values(valid), isBoolean, false, valid as FormShapeFlag<TFields>)
  })

  public readonly _validVerbose = Signal((monitor): FormShapeFlagVerbose<TFields> => {
    const validVerbose = mapValues(this._fields, ({ _validVerbose }) => _validVerbose.read(monitor))

    return validVerbose as FormShapeFlagVerbose<TFields>
  })

  // I N V A L I D

  public readonly _invalid = Signal((monitor): FormShapeFlag<TFields> => {
    const invalid = mapValues(this._fields, ({ _invalid }) => _invalid.read(monitor))

    return toConcise(values(invalid), isBoolean, false, invalid as FormShapeFlag<TFields>)
  })

  public readonly _invalidVerbose = Signal((monitor): FormShapeFlagVerbose<TFields> => {
    const invalidVerbose = mapValues(this._fields, ({ _invalidVerbose }) =>
      _invalidVerbose.read(monitor),
    )

    return invalidVerbose as FormShapeFlagVerbose<TFields>
  })

  // V A L I D A T E D

  public readonly _validated = Signal((monitor): FormShapeFlag<TFields> => {
    const validated = mapValues(this._fields, ({ _validated }) => _validated.read(monitor))

    return toConcise(values(validated), isBoolean, false, validated as FormShapeFlag<TFields>)
  })

  public readonly _validatedVerbose = Signal((monitor): FormShapeFlagVerbose<TFields> => {
    const validatedVerbose = mapValues(this._fields, ({ _validatedVerbose }) =>
      _validatedVerbose.read(monitor),
    )

    return validatedVerbose as FormShapeFlagVerbose<TFields>
  })

  public _forceValidated(monitor: Monitor): void {
    for (const field of values(this._fields)) {
      field._forceValidated(monitor)
    }
  }

  // D I R T Y

  public readonly _dirty = Signal((monitor): FormShapeFlag<TFields> => {
    const dirty = mapValues(this._fields, ({ _dirty }) => _dirty.read(monitor))

    return toConcise(values(dirty), isBoolean, false, dirty as FormShapeFlag<TFields>)
  })

  public readonly _dirtyVerbose = Signal((monitor): FormShapeFlagVerbose<TFields> => {
    const dirtyVerbose = mapValues(this._fields, ({ _dirtyVerbose }) => _dirtyVerbose.read(monitor))

    return dirtyVerbose as FormShapeFlagVerbose<TFields>
  })

  public readonly _dirtyOn = Signal((monitor): FormShapeFlag<TFields> => {
    const dirtyOn = mapValues(this._fields, ({ _dirtyOn }) => _dirtyOn.read(monitor))

    return toConcise(values(dirtyOn), isBoolean, false, dirtyOn as FormShapeFlag<TFields>)
  })

  public readonly _dirtyOnVerbose = Signal((monitor): FormShapeFlagVerbose<TFields> => {
    const dirtyOnVerbose = mapValues(this._fields, ({ _dirtyOnVerbose }) =>
      _dirtyOnVerbose.read(monitor),
    )

    return dirtyOnVerbose as FormShapeFlagVerbose<TFields>
  })

  // R E S E T

  public _reset(monitor: Monitor, resetter: undefined | FormShapeInputSetter<TFields>): void {
    if (!isUndefined(resetter)) {
      this._setInitial(monitor, resetter)
    }

    for (const field of values(this._fields)) {
      field._reset(monitor, undefined)
    }
  }

  // C H I L D R E N

  public _getChildren<TChildParams extends SignalFormParams>(): ReadonlyArray<
    SignalFormChild<TChildParams, FormShapeParams<TFields>>
  > {
    return map(entries(this._fields), ([key, field]) => ({
      _state: field as unknown as SignalFormState<TChildParams>,
      _mapToChild: (output) => output[key as keyof FormShapeOutput<TFields>],
    }))
  }
}

export type { FormShapeStateFields, FormShapeStateMeta }
export { FormShapeState }
