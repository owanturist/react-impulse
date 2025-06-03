import { isBoolean } from "~/tools/is-boolean"
import { isFunction } from "~/tools/is-function"
import { isNull } from "~/tools/is-null"
import { isString } from "~/tools/is-string"
import { isTrue } from "~/tools/is-true"
import { isTruthy } from "~/tools/is-truthy"
import { isUndefined } from "~/tools/is-undefined"
import { params } from "~/tools/params"

import { type Scope, batch } from "../dependencies"
import { ImpulseForm, isImpulseForm } from "../impulse-form"
import { VALIDATE_ON_TOUCH, type ValidateStrategy } from "../validate-strategy"

import type { ImpulseFormShapeError } from "./impulse-form-shape-error"
import type { ImpulseFormShapeErrorSetter } from "./impulse-form-shape-error-setter"
import type { ImpulseFormShapeErrorVerbose } from "./impulse-form-shape-error-verbose"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"
import type { ImpulseFormShapeFlag } from "./impulse-form-shape-flag"
import type { ImpulseFormShapeFlagSetter } from "./impulse-form-shape-flag-setter"
import type { ImpulseFormShapeFlagVerbose } from "./impulse-form-shape-flag-verbose"
import type { ImpulseFormShapeInput } from "./impulse-form-shape-input"
import type { ImpulseFormShapeInputSetter } from "./impulse-form-shape-input-setter"
import type { ImpulseFormShapeOutput } from "./impulse-form-shape-output"
import type { ImpulseFormShapeOutputVerbose } from "./impulse-form-shape-output-verbose"
import type { ImpulseFormShapeValidateOn } from "./impulse-form-shape-validate-on"
import type { ImpulseFormShapeValidateOnSetter } from "./impulse-form-shape-validate-on-setter"
import type { ImpulseFormShapeValidateOnVerbose } from "./impulse-form-shape-validate-on-verbose"

export class ImpulseFormShape<
  TFields extends ImpulseFormShapeFields = ImpulseFormShapeFields,
> extends ImpulseForm<{
  "input.schema": ImpulseFormShapeInput<TFields>
  "input.setter": ImpulseFormShapeInputSetter<TFields>

  "output.schema": ImpulseFormShapeOutput<TFields>
  "output.schema.verbose": ImpulseFormShapeOutputVerbose<TFields>

  "flag.setter": ImpulseFormShapeFlagSetter<TFields>
  "flag.schema": ImpulseFormShapeFlag<TFields>
  "flag.schema.verbose": ImpulseFormShapeFlagVerbose<TFields>

  "validateOn.setter": ImpulseFormShapeValidateOnSetter<TFields>
  "validateOn.schema": ImpulseFormShapeValidateOn<TFields>
  "validateOn.schema.verbose": ImpulseFormShapeValidateOnVerbose<TFields>

  "error.setter": ImpulseFormShapeErrorSetter<TFields>
  "error.schema": ImpulseFormShapeError<TFields>
  "error.schema.verbose": ImpulseFormShapeErrorVerbose<TFields>
}> {
  public readonly fields: Readonly<TFields>

  public constructor(root: null | ImpulseForm, fields: Readonly<TFields>) {
    super(root)

    const acc = {} as TFields

    for (const [key, field] of Object.entries(fields)) {
      acc[key as keyof TFields] = isImpulseForm(field)
        ? (ImpulseForm._childOf(this, field) as TFields[keyof TFields])
        : (field as TFields[keyof TFields])
    }

    this.fields = acc
  }

  private _mapFormFields<TResult>(
    fn: (form: ImpulseForm, key: string) => TResult,
  ): Readonly<Record<keyof TFields, TResult>> {
    const acc = {} as Record<keyof TFields, TResult>

    for (const [key, field] of Object.entries(this.fields)) {
      const result = isImpulseForm(field) ? fn(field, key) : (field as TResult)

      acc[key as keyof typeof acc] = result
    }

    return acc
  }

  protected _submitWith(
    output: ImpulseFormShapeOutput<TFields>,
  ): ReadonlyArray<void | Promise<unknown>> {
    const promises = Object.entries(this.fields).flatMap(([key, field]) => {
      if (!isImpulseForm(field)) {
        return []
      }

      return ImpulseForm._submitWith(field, output[key as keyof typeof output])
    })

    return [...super._submitWith(output), ...promises]
  }

  protected _getFocusFirstInvalid(scope: Scope): VoidFunction | null {
    for (const field of Object.values(this.fields)) {
      if (isImpulseForm(field)) {
        const focus = ImpulseForm._getFocusFirstInvalid(scope, field)

        if (focus != null) {
          return focus
        }
      }
    }

    return this._getFocusInvalid(scope)
  }

  protected _childOf(parent: null | ImpulseForm): ImpulseFormShape<TFields> {
    const fields = this._mapFormFields((form) =>
      ImpulseForm._childOf(this, form),
    )

    return new ImpulseFormShape(parent, fields as TFields[keyof TFields])
  }

  protected _setInitial(
    initial: undefined | ImpulseFormShape<TFields>,
    isRoot: boolean,
  ): void {
    for (const [key, field] of Object.entries(this.fields)) {
      if (isImpulseForm(field)) {
        ImpulseForm._setInitial(field, initial?.fields[key], isRoot)
      }
    }
  }

  protected _setValidated(isValidated: boolean): void {
    for (const field of Object.values(this.fields)) {
      if (isImpulseForm(field)) {
        ImpulseForm._setValidated(field, isValidated)
      }
    }
  }

  protected _isDirty<TResult>(
    scope: Scope,
    select: (
      concise: ImpulseFormShapeFlag<TFields>,
      verbose: ImpulseFormShapeFlagVerbose<TFields>,
      dirty: ImpulseFormShapeFlagVerbose<TFields>,
    ) => TResult,
  ): TResult {
    const keys = Object.keys(this.fields)

    let isAllDirty = true
    let isNoneDirty = true
    // make it easier for TS
    const isDirtyConcise = {} as Record<string, unknown>
    const isDirtyVerbose = {} as Record<string, unknown>
    const isDirtyDirty = {} as Record<string, unknown>

    for (const key of keys) {
      const field = this.fields[key]

      if (isImpulseForm(field)) {
        const [concise, verbose, dirty] = ImpulseForm._isDirty(
          scope,
          field,
          params,
        )

        isAllDirty = isAllDirty && concise === true
        isNoneDirty = isNoneDirty && concise === false
        isDirtyConcise[key] = concise
        isDirtyVerbose[key] = verbose
        isDirtyDirty[key] = dirty
      }
    }

    return select(
      isNoneDirty
        ? false
        : isAllDirty
          ? true
          : (isDirtyConcise as unknown as ImpulseFormShapeFlag<TFields>),
      isDirtyVerbose as unknown as ImpulseFormShapeFlagVerbose<TFields>,
      isDirtyDirty as unknown as ImpulseFormShapeFlagVerbose<TFields>,
    )
  }

  public getError(scope: Scope): ImpulseFormShapeError<TFields>
  public getError<TResult>(
    scope: Scope,
    select: (
      concise: ImpulseFormShapeError<TFields>,
      verbose: ImpulseFormShapeErrorVerbose<TFields>,
    ) => TResult,
  ): TResult
  public getError<TResult = ImpulseFormShapeError<TFields>>(
    scope: Scope,
    select: (
      concise: ImpulseFormShapeError<TFields>,
      verbose: ImpulseFormShapeErrorVerbose<TFields>,
    ) => TResult = params._first as typeof select,
  ): TResult {
    let errorsNone = true
    // make it easier for TS
    const errorsConcise = {} as Record<string, unknown>
    const errorsVerbose = {} as Record<string, unknown>

    for (const [key, field] of Object.entries(this.fields)) {
      if (isImpulseForm(field)) {
        const error = field.getError(scope, (concise, verbose) => ({
          concise,
          verbose,
        }))

        errorsNone = errorsNone && error.concise == null
        errorsConcise[key] = error.concise
        errorsVerbose[key] = error.verbose
      }
    }

    return select(
      errorsNone
        ? null
        : (errorsConcise as unknown as ImpulseFormShapeError<TFields>),
      errorsVerbose as unknown as ImpulseFormShapeErrorVerbose<TFields>,
    )
  }

  public setError(setter: ImpulseFormShapeErrorSetter<TFields>): void {
    batch((scope) => {
      const nextErrors = isFunction(setter)
        ? setter(this.getError(scope, params._second))
        : setter

      for (const [key, field] of Object.entries(this.fields)) {
        const nextFieldTouched =
          nextErrors == null
            ? nextErrors
            : nextErrors[key as keyof typeof nextErrors]

        if (isImpulseForm(field) && !isUndefined(nextFieldTouched)) {
          field.setError(nextFieldTouched)
        }
      }
    })
  }

  /**
   * @param scope
   *
   * @returns true when ALL fields are validated, otherwise false
   */
  public isValidated(scope: Scope): boolean

  public isValidated<TResult>(
    scope: Scope,
    select: (
      concise: ImpulseFormShapeFlag<TFields>,
      verbose: ImpulseFormShapeFlagVerbose<TFields>,
    ) => TResult,
  ): TResult
  public isValidated<TResult = boolean>(
    scope: Scope,
    select: (
      concise: ImpulseFormShapeFlag<TFields>,
      verbose: ImpulseFormShapeFlagVerbose<TFields>,
    ) => TResult = isTrue as unknown as typeof select,
  ): TResult {
    let validatedAll = true
    let validatedNone = true
    // make it easier for TS
    const validatedConcise = {} as Record<string, unknown>
    const validatedVerbose = {} as Record<string, unknown>

    for (const [key, field] of Object.entries(this.fields)) {
      if (isImpulseForm(field)) {
        const validated = field.isValidated(scope, (concise, verbose) => ({
          concise,
          verbose,
        }))

        validatedAll = validatedAll && validated.concise === true
        validatedNone = validatedNone && validated.concise === false
        validatedConcise[key] = validated.concise
        validatedVerbose[key] = validated.verbose
      }
    }

    return select(
      validatedNone
        ? false
        : validatedAll
          ? true
          : (validatedConcise as unknown as ImpulseFormShapeFlag<TFields>),
      validatedVerbose as unknown as ImpulseFormShapeFlagVerbose<TFields>,
    )
  }

  public getValidateOn(scope: Scope): ImpulseFormShapeValidateOn<TFields>
  public getValidateOn<TResult>(
    scope: Scope,
    select: (
      concise: ImpulseFormShapeValidateOn<TFields>,
      verbose: ImpulseFormShapeValidateOnVerbose<TFields>,
    ) => TResult,
  ): TResult
  public getValidateOn<TResult = ImpulseFormShapeValidateOn<TFields>>(
    scope: Scope,
    select: (
      concise: ImpulseFormShapeValidateOn<TFields>,
      verbose: ImpulseFormShapeValidateOnVerbose<TFields>,
    ) => TResult = params._first as typeof select,
  ): TResult {
    // make it easier for TS
    const validateOnConcise = {} as Record<string, unknown>
    const validateOnVerbose = {} as Record<string, unknown>

    for (const [key, field] of Object.entries(this.fields)) {
      if (isImpulseForm(field)) {
        const validateOn = field.getValidateOn(scope, (concise, verbose) => ({
          concise,
          verbose,
        }))

        validateOnConcise[key] = validateOn.concise
        validateOnVerbose[key] = validateOn.verbose
      }
    }

    const validateOnConciseValues = Object.values(validateOnConcise)

    return select(
      validateOnConciseValues.length === 0
        ? // defaults to "onTouch"
          VALIDATE_ON_TOUCH
        : validateOnConciseValues.every(isString) &&
            new Set(validateOnConciseValues).size === 1
          ? (validateOnConciseValues[0] as ValidateStrategy)
          : (validateOnConcise as unknown as ImpulseFormShapeValidateOn<TFields>),
      validateOnVerbose as unknown as ImpulseFormShapeValidateOnVerbose<TFields>,
    )
  }

  public setValidateOn(
    validateOn: ImpulseFormShapeValidateOnSetter<TFields>,
  ): void {
    batch((scope) => {
      const nextValidateOn = isFunction(validateOn)
        ? validateOn(this.getValidateOn(scope, params._second))
        : validateOn

      for (const [key, field] of Object.entries(this.fields)) {
        const nextFieldTouched = isString(nextValidateOn)
          ? nextValidateOn
          : nextValidateOn[key as keyof typeof nextValidateOn]

        if (isImpulseForm(field) && !isUndefined(nextFieldTouched)) {
          field.setValidateOn(nextFieldTouched)
        }
      }
    })
  }

  public isTouched(scope: Scope): boolean
  public isTouched<TResult>(
    scope: Scope,
    select: (
      concise: ImpulseFormShapeFlag<TFields>,
      verbose: ImpulseFormShapeFlagVerbose<TFields>,
    ) => TResult,
  ): TResult
  public isTouched<TResult = boolean>(
    scope: Scope,
    select: (
      concise: ImpulseFormShapeFlag<TFields>,
      verbose: ImpulseFormShapeFlagVerbose<TFields>,
    ) => TResult = isTruthy as unknown as typeof select,
  ): TResult {
    let touchedAll = true
    let touchedNone = true
    // make it easier for TS
    const touchedConcise = {} as Record<string, unknown>
    const touchedVerbose = {} as Record<string, unknown>

    for (const [key, field] of Object.entries(this.fields)) {
      if (isImpulseForm(field)) {
        const touched = field.isTouched(scope, (concise, verbose) => ({
          concise,
          verbose,
        }))

        touchedAll = touchedAll && touched.concise === true
        touchedNone = touchedNone && touched.concise === false
        touchedConcise[key] = touched.concise
        touchedVerbose[key] = touched.verbose
      }
    }

    return select(
      touchedNone
        ? false
        : touchedAll
          ? true
          : (touchedConcise as unknown as ImpulseFormShapeFlag<TFields>),
      touchedVerbose as unknown as ImpulseFormShapeFlagVerbose<TFields>,
    )
  }

  public setTouched(touched: ImpulseFormShapeFlagSetter<TFields>): void {
    batch((scope) => {
      const nextTouched = isFunction(touched)
        ? touched(this.isTouched(scope, params._second))
        : touched

      for (const [key, field] of Object.entries(this.fields)) {
        const nextFieldTouched = isBoolean(nextTouched)
          ? nextTouched
          : nextTouched[key as keyof typeof nextTouched]

        if (isImpulseForm(field) && !isUndefined(nextFieldTouched)) {
          field.setTouched(nextFieldTouched)
        }
      }
    })
  }

  public reset(
    resetter: ImpulseFormShapeInputSetter<TFields> = params._first as typeof resetter,
  ): void {
    batch((scope) => {
      const resetValue = isFunction(resetter)
        ? resetter(this.getInitial(scope), this.getInput(scope))
        : resetter

      for (const [key, field] of Object.entries(this.fields)) {
        if (isImpulseForm(field)) {
          field.reset(resetValue[key as keyof typeof resetValue])
        }
      }
    })
  }

  public getOutput(scope: Scope): null | ImpulseFormShapeOutput<TFields>
  public getOutput<TResult>(
    scope: Scope,
    select: (
      concise: null | ImpulseFormShapeOutput<TFields>,
      verbose: ImpulseFormShapeOutputVerbose<TFields>,
    ) => TResult,
  ): TResult
  public getOutput<TResult = null | ImpulseFormShapeOutput<TFields>>(
    scope: Scope,
    select: (
      concise: null | ImpulseFormShapeOutput<TFields>,
      verbose: ImpulseFormShapeOutputVerbose<TFields>,
    ) => TResult = params._first as typeof select,
  ): TResult {
    let allValid = true
    // make it easier for TS
    const valueConcise = {} as Record<string, unknown>
    const valueVerbose = {} as Record<string, unknown>

    for (const [key, field] of Object.entries(this.fields)) {
      if (isImpulseForm(field)) {
        const output = field.getOutput(scope, (concise, verbose) => ({
          concise,
          verbose,
        }))

        allValid = allValid && !isNull(output.concise)
        valueConcise[key] = output.concise
        valueVerbose[key] = output.verbose
      } else {
        valueConcise[key] = field
        valueVerbose[key] = field
      }
    }

    return select(
      allValid
        ? (valueConcise as unknown as ImpulseFormShapeOutput<TFields>)
        : null,
      valueVerbose as unknown as ImpulseFormShapeOutputVerbose<TFields>,
    )
  }

  public getInput(scope: Scope): ImpulseFormShapeInput<TFields> {
    const input = this._mapFormFields((form) => form.getInput(scope))

    return input as unknown as ImpulseFormShapeInput<TFields>
  }

  // TODO add tests against initial coming as second argument
  public setInput(setter: ImpulseFormShapeInputSetter<TFields>): void {
    batch((scope) => {
      const nextInput = isFunction(setter)
        ? setter(this.getInput(scope), this.getInitial(scope))
        : setter

      for (const [key, field] of Object.entries(this.fields)) {
        const nextFieldInput = nextInput[key as keyof typeof nextInput]

        if (isImpulseForm(field) && !isUndefined(nextFieldInput)) {
          field.setInput(nextFieldInput)
        }
      }
    })
  }

  public getInitial(scope: Scope): ImpulseFormShapeInput<TFields> {
    const initial = this._mapFormFields((form) => form.getInitial(scope))

    return initial as unknown as ImpulseFormShapeInput<TFields>
  }

  // TODO add tests against input coming as second argument
  public setInitial(setter: ImpulseFormShapeInputSetter<TFields>): void {
    batch((scope) => {
      const nextInitial = isFunction(setter)
        ? setter(this.getInitial(scope), this.getInput(scope))
        : setter

      for (const [key, field] of Object.entries(this.fields)) {
        const nextFieldInitial = nextInitial[key as keyof typeof nextInitial]

        if (isImpulseForm(field) && !isUndefined(nextFieldInitial)) {
          field.setInitial(nextFieldInitial)
        }
      }
    })
  }
}
