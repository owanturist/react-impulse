import type Types from "ts-toolbelt"

import {
  type Scope,
  batch,
  identity,
  isBoolean,
  isFunction,
  isTruthy,
  isDefined,
  isString,
} from "./dependencies"
import {
  type ComputeObject,
  isTrue,
  type Setter,
  resolveSetter,
  shallowArraySame,
} from "./utils"
import {
  type GetImpulseFormParam,
  type ImpulseFormParamsKeys,
  ImpulseForm,
} from "./ImpulseForm"
import { VALIDATE_ON_TOUCH, type ValidateStrategy } from "./ValidateStrategy"

export type ImpulseFormShapeFields = Types.Object.Record<string | number>

type ImpulseFormShapeParam<
  TFields extends ImpulseFormShapeFields,
  TKey extends ImpulseFormParamsKeys,
  TFallback extends "field" | "nothing" = "nothing",
> = ComputeObject<
  Types.Object.Filter<
    {
      readonly [TField in Types.Any.Keys<TFields>]: GetImpulseFormParam<
        TFields[TField],
        TKey,
        TFallback extends "field" ? TFields[TField] : never
      >
    },
    never,
    "equals"
  >
>

export type ImpulseFormShapeValueSchema<
  TFields extends ImpulseFormShapeFields,
> = ImpulseFormShapeParam<TFields, "value.schema", "field">

export type ImpulseFormShapeValueSchemaVerbose<
  TFields extends ImpulseFormShapeFields,
> = ImpulseFormShapeParam<TFields, "value.schema.verbose", "field">

export type ImpulseFormShapeOriginalValueSchema<
  TFields extends ImpulseFormShapeFields,
> = ImpulseFormShapeParam<TFields, "originalValue.schema", "field">

export type ImpulseFormShapeOriginalValueSetter<
  TFields extends ImpulseFormShapeFields,
> = Setter<
  Partial<ImpulseFormShapeParam<TFields, "originalValue.setter">>,
  [
    ImpulseFormShapeOriginalValueSchema<TFields>,
    ImpulseFormShapeOriginalValueSchema<TFields>,
  ]
>

export type ImpulseFormShapeFlagSchema<TFields extends ImpulseFormShapeFields> =
  boolean | ImpulseFormShapeParam<TFields, "flag.schema">

export type ImpulseFormShapeFlagSchemaVerbose<
  TFields extends ImpulseFormShapeFields,
> = ImpulseFormShapeParam<TFields, "flag.schema.verbose">

export type ImpulseFormShapeFlagSetter<TFields extends ImpulseFormShapeFields> =
  Setter<
    boolean | Partial<ImpulseFormShapeParam<TFields, "flag.setter">>,
    [ImpulseFormShapeFlagSchemaVerbose<TFields>]
  >

export type ImpulseFormShapeValidateOnSchema<
  TFields extends ImpulseFormShapeFields,
> = ValidateStrategy | ImpulseFormShapeParam<TFields, "validateOn.schema">

export type ImpulseFormShapeValidateOnSchemaVerbose<
  TFields extends ImpulseFormShapeFields,
> = ImpulseFormShapeParam<TFields, "validateOn.schema.verbose">

export type ImpulseFormShapeValidateOnSetter<
  TFields extends ImpulseFormShapeFields,
> = Setter<
  | ValidateStrategy
  | Partial<ImpulseFormShapeParam<TFields, "validateOn.setter">>,
  [ImpulseFormShapeValidateOnSchemaVerbose<TFields>]
>

export type ImpulseFormShapeErrorSetter<
  TFields extends ImpulseFormShapeFields,
> = Setter<
  null | Partial<ImpulseFormShapeParam<TFields, "errors.setter">>,
  [ImpulseFormShapeErrorSchemaVerbose<TFields>]
>

export type ImpulseFormShapeErrorSchema<
  TFields extends ImpulseFormShapeFields,
> = null | ImpulseFormShapeParam<TFields, "errors.schema">

export type ImpulseFormShapeErrorSchemaVerbose<
  TFields extends ImpulseFormShapeFields,
> = ImpulseFormShapeParam<TFields, "errors.schema.verbose">

export interface ImpulseFormShapeOptions<
  TFields extends ImpulseFormShapeFields,
> {
  touched?: ImpulseFormShapeFlagSetter<TFields>
  initialValue?: ImpulseFormShapeOriginalValueSetter<TFields>
  originalValue?: ImpulseFormShapeOriginalValueSetter<TFields>
  validateOn?: ImpulseFormShapeValidateOnSetter<TFields>
  errors?: ImpulseFormShapeErrorSetter<TFields>
}

export class ImpulseFormShape<
  TFields extends ImpulseFormShapeFields = ImpulseFormShapeFields,
> extends ImpulseForm<{
  "value.schema": ImpulseFormShapeValueSchema<TFields>
  "value.schema.verbose": ImpulseFormShapeValueSchemaVerbose<TFields>

  "originalValue.setter": ImpulseFormShapeOriginalValueSetter<TFields>
  "originalValue.schema": ImpulseFormShapeOriginalValueSchema<TFields>

  "flag.setter": ImpulseFormShapeFlagSetter<TFields>
  "flag.schema": ImpulseFormShapeFlagSchema<TFields>
  "flag.schema.verbose": ImpulseFormShapeFlagSchemaVerbose<TFields>

  "validateOn.setter": ImpulseFormShapeValidateOnSetter<TFields>
  "validateOn.schema": ImpulseFormShapeValidateOnSchema<TFields>
  "validateOn.schema.verbose": ImpulseFormShapeValidateOnSchemaVerbose<TFields>

  "errors.setter": ImpulseFormShapeErrorSetter<TFields>
  "errors.schema": ImpulseFormShapeErrorSchema<TFields>
  "errors.schema.verbose": ImpulseFormShapeErrorSchemaVerbose<TFields>
}> {
  public static of<TFields extends ImpulseFormShapeFields>(
    fields: Readonly<TFields>,
    {
      touched,
      initialValue,
      originalValue,
      validateOn,
      errors,
    }: ImpulseFormShapeOptions<TFields> = {},
  ): ImpulseFormShape<TFields> {
    const shape = new ImpulseFormShape(null, fields)

    batch(() => {
      if (isDefined.strict(touched)) {
        shape.setTouched(touched)
      }

      if (isDefined.strict(initialValue)) {
        shape.setInitialValue(initialValue)
      }

      if (isDefined.strict(originalValue)) {
        shape.setOriginalValue(originalValue)
      }

      if (isDefined(validateOn)) {
        shape.setValidateOn(validateOn)
      }

      // TODO add test against null
      if (isDefined.strict(errors)) {
        shape.setErrors(errors)
      }
    })

    return shape
  }

  public readonly fields: Readonly<TFields>

  protected constructor(root: null | ImpulseForm, fields: Readonly<TFields>) {
    super(root)

    const acc = {} as TFields

    for (const [key, field] of Object.entries(fields)) {
      acc[key as keyof TFields] = ImpulseForm.isImpulseForm(field)
        ? (ImpulseForm._childOf(this, field) as TFields[keyof TFields])
        : (field as TFields[keyof TFields])
    }

    this.fields = acc
  }

  private _mapFormFields<TResult>(
    fn: (form: ImpulseForm) => TResult,
  ): Readonly<Record<keyof TFields, TResult>> {
    const acc = {} as Record<keyof TFields, TResult>

    for (const [key, field] of Object.entries(this.fields)) {
      const value = ImpulseForm.isImpulseForm(field)
        ? fn(field)
        : (field as TResult)

      acc[key as keyof typeof acc] = value
    }

    return acc
  }

  protected _submitWith(
    value: ImpulseFormShapeValueSchema<TFields>,
  ): ReadonlyArray<void | Promise<unknown>> {
    const promises = Object.entries(this.fields).flatMap(([key, field]) => {
      if (!ImpulseForm.isImpulseForm(field)) {
        return []
      }

      return ImpulseForm._submitWith(field, value[key as keyof typeof value])
    })

    return [...super._submitWith(value), ...promises]
  }

  protected _getFocusFirstInvalidValue(): VoidFunction | null {
    for (const field of Object.values(this.fields)) {
      if (ImpulseForm.isImpulseForm(field)) {
        const focus = ImpulseForm._getFocusFirstInvalidValue(field)

        if (focus != null) {
          return focus
        }
      }
    }

    return null
  }

  protected _childOf(parent: null | ImpulseForm): ImpulseFormShape<TFields> {
    return new ImpulseFormShape(parent, this.fields)
  }

  protected _setValidated(isValidated: boolean): void {
    for (const field of Object.values(this.fields)) {
      if (ImpulseForm.isImpulseForm(field)) {
        ImpulseForm._setValidated(field, isValidated)
      }
    }
  }

  protected _isDirtyWith(
    scope: Scope,
    initial: ImpulseFormShape<TFields>,
  ): boolean {
    const keys = Object.keys(this.fields)

    if (!shallowArraySame(keys, Object.keys(initial.fields))) {
      return false
    }

    for (const key of keys) {
      const originalField = this.fields[key]
      const initialField = initial.fields[key]

      if (
        ImpulseForm.isImpulseForm(originalField) &&
        ImpulseForm.isImpulseForm(initialField) &&
        !ImpulseForm._isDirtyWith(scope, originalField, initialField)
      ) {
        return false
      }
    }

    return true
  }

  public getErrors(scope: Scope): ImpulseFormShapeErrorSchema<TFields>
  public getErrors<TResult>(
    scope: Scope,
    select: (
      concise: ImpulseFormShapeErrorSchema<TFields>,
      verbose: ImpulseFormShapeErrorSchemaVerbose<TFields>,
    ) => TResult,
  ): TResult
  public getErrors<TResult = ImpulseFormShapeErrorSchema<TFields>>(
    scope: Scope,
    select: (
      concise: ImpulseFormShapeErrorSchema<TFields>,
      verbose: ImpulseFormShapeErrorSchemaVerbose<TFields>,
    ) => TResult = identity as typeof select,
  ): TResult {
    let errorsNone = true
    // make it easier for TS
    const errorsConcise = {} as Record<string, unknown>
    const errorsVerbose = {} as Record<string, unknown>

    for (const [key, field] of Object.entries(this.fields)) {
      if (ImpulseForm.isImpulseForm(field)) {
        const errors = field.getErrors(scope, (concise, verbose) => ({
          concise,
          verbose,
        }))

        errorsNone = errorsNone && errors.concise == null
        errorsConcise[key] = errors.concise
        errorsVerbose[key] = errors.verbose
      }
    }

    return select(
      errorsNone
        ? null
        : (errorsConcise as unknown as ImpulseFormShapeErrorSchema<TFields>),
      errorsVerbose as unknown as ImpulseFormShapeErrorSchemaVerbose<TFields>,
    )
  }

  public setErrors(errors: ImpulseFormShapeErrorSetter<TFields>): void {
    batch((scope) => {
      const nextErrors = isFunction(errors)
        ? errors(this.getErrors(scope, (_, verbose) => verbose))
        : errors

      for (const [key, field] of Object.entries(this.fields)) {
        const nextFieldTouched =
          nextErrors == null
            ? nextErrors
            : nextErrors[key as keyof typeof nextErrors]

        if (
          ImpulseForm.isImpulseForm(field) &&
          nextFieldTouched !== undefined
        ) {
          field.setErrors(nextFieldTouched)
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
      concise: ImpulseFormShapeFlagSchema<TFields>,
      verbose: ImpulseFormShapeFlagSchemaVerbose<TFields>,
    ) => TResult,
  ): TResult
  public isValidated<TResult = boolean>(
    scope: Scope,
    select: (
      concise: ImpulseFormShapeFlagSchema<TFields>,
      verbose: ImpulseFormShapeFlagSchemaVerbose<TFields>,
    ) => TResult = isTrue as unknown as typeof select,
  ): TResult {
    let validatedAll = true
    let validatedNone = true
    // make it easier for TS
    const validatedConcise = {} as Record<string, unknown>
    const validatedVerbose = {} as Record<string, unknown>

    for (const [key, field] of Object.entries(this.fields)) {
      if (ImpulseForm.isImpulseForm(field)) {
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
          : (validatedConcise as unknown as ImpulseFormShapeFlagSchema<TFields>),
      validatedVerbose as unknown as ImpulseFormShapeFlagSchemaVerbose<TFields>,
    )
  }

  public getValidateOn(scope: Scope): ImpulseFormShapeValidateOnSchema<TFields>
  public getValidateOn<TResult>(
    scope: Scope,
    select: (
      concise: ImpulseFormShapeValidateOnSchema<TFields>,
      verbose: ImpulseFormShapeValidateOnSchemaVerbose<TFields>,
    ) => TResult,
  ): TResult
  public getValidateOn<TResult = ImpulseFormShapeValidateOnSchema<TFields>>(
    scope: Scope,
    select: (
      concise: ImpulseFormShapeValidateOnSchema<TFields>,
      verbose: ImpulseFormShapeValidateOnSchemaVerbose<TFields>,
    ) => TResult = identity as typeof select,
  ): TResult {
    // make it easier for TS
    const validateOnConcise = {} as Record<string, unknown>
    const validateOnVerbose = {} as Record<string, unknown>

    for (const [key, field] of Object.entries(this.fields)) {
      if (ImpulseForm.isImpulseForm(field)) {
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
          : (validateOnConcise as unknown as ImpulseFormShapeValidateOnSchema<TFields>),
      validateOnVerbose as unknown as ImpulseFormShapeValidateOnSchemaVerbose<TFields>,
    )
  }

  public setValidateOn(
    validateOn: ImpulseFormShapeValidateOnSetter<TFields>,
  ): void {
    batch((scope) => {
      const nextValidateOn = isFunction(validateOn)
        ? validateOn(this.getValidateOn(scope, (_, verbose) => verbose))
        : validateOn

      for (const [key, field] of Object.entries(this.fields)) {
        const nextFieldTouched = isString(nextValidateOn)
          ? nextValidateOn
          : nextValidateOn[key as keyof typeof nextValidateOn]

        if (
          ImpulseForm.isImpulseForm(field) &&
          isDefined.strict(nextFieldTouched)
        ) {
          field.setValidateOn(nextFieldTouched)
        }
      }
    })
  }

  public isTouched(scope: Scope): boolean
  public isTouched<TResult>(
    scope: Scope,
    select: (
      concise: ImpulseFormShapeFlagSchema<TFields>,
      verbose: ImpulseFormShapeFlagSchemaVerbose<TFields>,
    ) => TResult,
  ): TResult
  public isTouched<TResult = boolean>(
    scope: Scope,
    select: (
      concise: ImpulseFormShapeFlagSchema<TFields>,
      verbose: ImpulseFormShapeFlagSchemaVerbose<TFields>,
    ) => TResult = isTruthy as unknown as typeof select,
  ): TResult {
    let touchedAll = true
    let touchedNone = true
    // make it easier for TS
    const touchedConcise = {} as Record<string, unknown>
    const touchedVerbose = {} as Record<string, unknown>

    for (const [key, field] of Object.entries(this.fields)) {
      if (ImpulseForm.isImpulseForm(field)) {
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
          : (touchedConcise as unknown as ImpulseFormShapeFlagSchema<TFields>),
      touchedVerbose as unknown as ImpulseFormShapeFlagSchemaVerbose<TFields>,
    )
  }

  public setTouched(touched: ImpulseFormShapeFlagSetter<TFields>): void {
    batch((scope) => {
      const nextTouched = isFunction(touched)
        ? touched(this.isTouched(scope, (_, verbose) => verbose))
        : touched

      for (const [key, field] of Object.entries(this.fields)) {
        const nextFieldTouched = isBoolean(nextTouched)
          ? nextTouched
          : nextTouched[key as keyof typeof nextTouched]

        if (
          ImpulseForm.isImpulseForm(field) &&
          nextFieldTouched !== undefined
        ) {
          field.setTouched(nextFieldTouched)
        }
      }
    })
  }

  public reset(
    resetter: ImpulseFormShapeOriginalValueSetter<TFields> = identity as typeof resetter,
  ): void {
    batch((scope) => {
      const resetValue = isFunction(resetter)
        ? resetter(this.getInitialValue(scope), this.getOriginalValue(scope))
        : resetter

      for (const [key, field] of Object.entries(this.fields)) {
        if (ImpulseForm.isImpulseForm(field)) {
          field.reset(resetValue[key as keyof typeof resetValue])
        }
      }
    })
  }

  public isDirty(scope: Scope): boolean
  public isDirty<TResult>(
    scope: Scope,
    select: (
      concise: ImpulseFormShapeFlagSchema<TFields>,
      verbose: ImpulseFormShapeFlagSchemaVerbose<TFields>,
    ) => TResult,
  ): TResult
  public isDirty<TResult = boolean>(
    scope: Scope,
    select: (
      concise: ImpulseFormShapeFlagSchema<TFields>,
      verbose: ImpulseFormShapeFlagSchemaVerbose<TFields>,
    ) => TResult = isTruthy as unknown as typeof select,
  ): TResult {
    let touchedAll = true
    let touchedNone = true
    // make it easier for TS
    const touchedConcise = {} as Record<string, unknown>
    const touchedVerbose = {} as Record<string, unknown>

    for (const [key, field] of Object.entries(this.fields)) {
      if (ImpulseForm.isImpulseForm(field)) {
        const touched = field.isDirty(scope, (concise, verbose) => ({
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
          : (touchedConcise as unknown as ImpulseFormShapeFlagSchema<TFields>),
      touchedVerbose as unknown as ImpulseFormShapeFlagSchemaVerbose<TFields>,
    )
  }

  public getValue(scope: Scope): null | ImpulseFormShapeValueSchema<TFields>
  public getValue<TResult>(
    scope: Scope,
    select: (
      concise: null | ImpulseFormShapeValueSchema<TFields>,
      verbose: ImpulseFormShapeValueSchemaVerbose<TFields>,
    ) => TResult,
  ): TResult
  public getValue<TResult = null | ImpulseFormShapeValueSchema<TFields>>(
    scope: Scope,
    select: (
      concise: null | ImpulseFormShapeValueSchema<TFields>,
      verbose: ImpulseFormShapeValueSchemaVerbose<TFields>,
    ) => TResult = identity as typeof select,
  ): TResult {
    let allValid = true
    // make it easier for TS
    const valueConcise = {} as Record<string, unknown>
    const valueVerbose = {} as Record<string, unknown>

    for (const [key, field] of Object.entries(this.fields)) {
      if (ImpulseForm.isImpulseForm(field)) {
        const value = field.getValue(scope, (concise, verbose) => ({
          concise,
          verbose,
        }))

        allValid = allValid && value.concise !== null
        valueConcise[key] = value.concise
        valueVerbose[key] = value.verbose
      } else {
        valueConcise[key] = field
        valueVerbose[key] = field
      }
    }

    return select(
      allValid
        ? (valueConcise as unknown as ImpulseFormShapeValueSchema<TFields>)
        : null,
      valueVerbose as unknown as ImpulseFormShapeValueSchemaVerbose<TFields>,
    )
  }

  public getOriginalValue(
    scope: Scope,
  ): ImpulseFormShapeOriginalValueSchema<TFields> {
    const originalValue = this._mapFormFields((form) =>
      form.getOriginalValue(scope),
    )

    return originalValue as unknown as ImpulseFormShapeOriginalValueSchema<TFields>
  }

  // TODO add tests against initialValue coming as second argument
  public setOriginalValue(
    setter: ImpulseFormShapeOriginalValueSetter<TFields>,
  ): void {
    batch((scope) => {
      const nextOriginalValue = resolveSetter(
        setter,
        this.getOriginalValue(scope),
        this.getInitialValue(scope),
      )

      for (const [key, field] of Object.entries(this.fields)) {
        const nextFieldOriginalValue =
          nextOriginalValue[key as keyof typeof nextOriginalValue]

        if (
          ImpulseForm.isImpulseForm(field) &&
          nextFieldOriginalValue !== undefined
        ) {
          field.setOriginalValue(nextFieldOriginalValue)
        }
      }
    })
  }

  public getInitialValue(
    scope: Scope,
  ): ImpulseFormShapeOriginalValueSchema<TFields> {
    const originalValue = this._mapFormFields((form) =>
      form.getInitialValue(scope),
    )

    return originalValue as unknown as ImpulseFormShapeOriginalValueSchema<TFields>
  }

  // TODO add tests against originalValue coming as second argument
  public setInitialValue(
    setter: ImpulseFormShapeOriginalValueSetter<TFields>,
  ): void {
    batch((scope) => {
      const nextInitialValue = resolveSetter(
        setter,
        this.getInitialValue(scope),
        this.getOriginalValue(scope),
      )

      for (const [key, field] of Object.entries(this.fields)) {
        const nextFieldInitialValue =
          nextInitialValue[key as keyof typeof nextInitialValue]

        if (
          ImpulseForm.isImpulseForm(field) &&
          nextFieldInitialValue !== undefined
        ) {
          field.setInitialValue(nextFieldInitialValue)
        }
      }
    })
  }
}
