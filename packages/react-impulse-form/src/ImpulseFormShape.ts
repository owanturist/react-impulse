import { type Scope, batch } from "react-impulse"
import {
  identity,
  isBoolean,
  isDefined,
  isFunction,
  isTruthy,
  mapValues,
} from "remeda"
import type Types from "ts-toolbelt"

import type { Setter } from "~/tools/setter"

import {
  type GetImpulseFormParam,
  ImpulseForm,
  type ImpulseFormParamsKeys,
} from "./ImpulseForm"
import type { ImpulseFormContext } from "./ImpulseFormContext"

type ImpulseFormShapeFields = Types.Object.Record<string | number>

type ImpulseFormShapeParam<
  TFields extends ImpulseFormShapeFields,
  TKey extends ImpulseFormParamsKeys,
  TFallback extends "field" | "nothing" = "nothing",
> = Types.Any.Compute<
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
  [originalValue: ImpulseFormShapeOriginalValueSchema<TFields>]
>

export type ImpulseFormShapeOriginalValueResetter<
  TFields extends ImpulseFormShapeFields,
> = Setter<
  Partial<ImpulseFormShapeParam<TFields, "originalValue.resetter">>,
  [
    initialValue: ImpulseFormShapeOriginalValueSchema<TFields>,
    originalValue: ImpulseFormShapeOriginalValueSchema<TFields>,
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
  errors?: ImpulseFormShapeErrorSetter<TFields>
}

export class ImpulseFormShape<
  TFields extends ImpulseFormShapeFields,
> extends ImpulseForm<{
  "value.schema": ImpulseFormShapeValueSchema<TFields>
  "value.schema.verbose": ImpulseFormShapeValueSchemaVerbose<TFields>

  "originalValue.setter": ImpulseFormShapeOriginalValueSetter<TFields>
  "originalValue.resetter": ImpulseFormShapeOriginalValueResetter<TFields>
  "originalValue.schema": ImpulseFormShapeOriginalValueSchema<TFields>

  "flag.setter": ImpulseFormShapeFlagSetter<TFields>
  "flag.schema": ImpulseFormShapeFlagSchema<TFields>
  "flag.schema.verbose": ImpulseFormShapeFlagSchemaVerbose<TFields>

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
      errors,
    }: ImpulseFormShapeOptions<TFields> = {},
  ): ImpulseFormShape<TFields> {
    const shape = new ImpulseFormShape(fields)

    batch(() => {
      if (isDefined(touched)) {
        shape.setTouched(touched)
      }

      if (isDefined(initialValue)) {
        shape.setInitialValue(initialValue)
      }

      if (isDefined(originalValue)) {
        shape.setOriginalValue(originalValue)
      }

      if (isDefined(errors)) {
        shape.setErrors(errors)
      }
    })

    return shape
  }

  protected constructor(public readonly fields: Readonly<TFields>) {
    super()

    // TODO investigate why setValue during render
    // for (const field of Object.values(fields)) {
    //   if (ImpulseForm.isImpulseForm(field)) {
    //     ImpulseForm.setParent(field, this)
    //   }
    // }
  }

  private mapFormFields<TResult>(
    fn: (form: ImpulseForm) => TResult,
  ): Types.Object.Record<keyof TFields, TResult, ["!", "R"]> {
    return mapValues(this.fields, (value) => {
      return ImpulseForm.isImpulseForm(value) ? fn(value) : value
    }) as Record<keyof TFields, TResult>
  }

  public setContext(context: ImpulseFormContext): void {
    batch(() => {
      this.context.setValue(context)

      for (const field of Object.values(this.fields)) {
        if (ImpulseForm.isImpulseForm(field)) {
          field.setContext(context)
        }
      }
    })
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
    // TODO DRY
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
        : (errorsConcise as ImpulseFormShapeErrorSchema<TFields>),
      errorsVerbose as ImpulseFormShapeErrorSchemaVerbose<TFields>,
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
    // TODO DRY
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
      touchedAll
        ? true
        : touchedNone
          ? false
          : (touchedConcise as ImpulseFormShapeFlagSchema<TFields>),
      touchedVerbose as ImpulseFormShapeFlagSchemaVerbose<TFields>,
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

  public reset(): void
  public reset(resetter: ImpulseFormShapeOriginalValueResetter<TFields>): void
  public reset(
    resetter: ImpulseFormShapeOriginalValueResetter<TFields> = identity as typeof resetter,
  ): void {
    // TODO DRY
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
    // TODO DRY
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
      touchedAll
        ? true
        : touchedNone
          ? false
          : (touchedConcise as ImpulseFormShapeFlagSchema<TFields>),
      touchedVerbose as ImpulseFormShapeFlagSchemaVerbose<TFields>,
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

        // eslint-disable-next-line eqeqeq
        allValid = allValid && value.concise !== null
        valueConcise[key] = value.concise
        valueVerbose[key] = value.verbose
      } else {
        valueConcise[key] = field
        valueVerbose[key] = field
      }
    }

    return select(
      allValid ? (valueConcise as ImpulseFormShapeValueSchema<TFields>) : null,
      valueVerbose as ImpulseFormShapeValueSchemaVerbose<TFields>,
    )
  }

  public getOriginalValue(
    scope: Scope,
  ): ImpulseFormShapeOriginalValueSchema<TFields> {
    const originalValue = this.mapFormFields((form) =>
      form.getOriginalValue(scope),
    )

    return originalValue as unknown as ImpulseFormShapeOriginalValueSchema<TFields>
  }

  public setOriginalValue(
    setter: ImpulseFormShapeOriginalValueSetter<TFields>,
  ): void {
    batch((scope) => {
      const nextOriginalValue = isFunction(setter)
        ? setter(this.getOriginalValue(scope))
        : setter

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
    const originalValue = this.mapFormFields((form) =>
      form.getInitialValue(scope),
    )

    return originalValue as unknown as ImpulseFormShapeOriginalValueSchema<TFields>
  }

  public setInitialValue(
    setter: ImpulseFormShapeOriginalValueSetter<TFields>,
  ): void {
    batch((scope) => {
      const nextInitialValue = isFunction(setter)
        ? setter(this.getInitialValue(scope))
        : setter

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

  public getFocusFirstInvalidValue(scope: Scope): VoidFunction | null {
    // TODO DRY
    for (const field of Object.values(this.fields)) {
      if (ImpulseForm.isImpulseForm(field)) {
        const focus = field.getFocusFirstInvalidValue(scope)

        if (focus != null) {
          return focus
        }
      }
    }

    return null
  }

  public clone(): ImpulseFormShape<TFields> {
    const fields = this.mapFormFields((form) => form.clone())

    return new ImpulseFormShape(fields as Readonly<TFields>)
  }
}
