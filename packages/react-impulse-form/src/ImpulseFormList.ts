import {
  type Scope,
  batch,
  identity,
  isBoolean,
  isFunction,
  isTruthy,
  isDefined,
  isString,
  isArray,
  Impulse,
} from "./dependencies"
import {
  type Setter,
  forEach2,
  isTrue,
  shallowArrayEquals,
  isFalse,
} from "./utils"
import { type GetImpulseFormParam, ImpulseForm } from "./ImpulseForm"
import { VALIDATE_ON_TOUCH, type ValidateStrategy } from "./ValidateStrategy"

export type ImpulseFormListValueSchema<TElement extends ImpulseForm> =
  ReadonlyArray<GetImpulseFormParam<TElement, "value.schema">>

export type ImpulseFormListValueSchemaVerbose<TElement extends ImpulseForm> =
  ReadonlyArray<GetImpulseFormParam<TElement, "value.schema.verbose">>

export type ImpulseFormListOriginalValueSchema<TElement extends ImpulseForm> =
  ReadonlyArray<GetImpulseFormParam<TElement, "originalValue.schema">>

export type ImpulseFormListOriginalValueSetter<TElement extends ImpulseForm> =
  Setter<
    ReadonlyArray<
      undefined | GetImpulseFormParam<TElement, "originalValue.setter">
    >,
    [originalValue: ImpulseFormListOriginalValueSchema<TElement>]
  >

export type ImpulseFormListOriginalValueResetter<TElement extends ImpulseForm> =
  Setter<
    ReadonlyArray<
      undefined | GetImpulseFormParam<TElement, "originalValue.resetter">
    >,
    [
      initialValue: ImpulseFormListOriginalValueSchema<TElement>,
      originalValue: ImpulseFormListOriginalValueSchema<TElement>,
    ]
  >

export type ImpulseFormListFlagSchema<TElement extends ImpulseForm> =
  | boolean
  | ReadonlyArray<GetImpulseFormParam<TElement, "flag.schema">>

export type ImpulseFormShapeListSchemaVerbose<TElement extends ImpulseForm> =
  ReadonlyArray<GetImpulseFormParam<TElement, "flag.schema.verbose">>

export type ImpulseFormListFlagSetter<TElement extends ImpulseForm> = Setter<
  | boolean
  | ReadonlyArray<undefined | GetImpulseFormParam<TElement, "flag.setter">>,
  [ImpulseFormShapeListSchemaVerbose<TElement>]
>

export type ImpulseFormListValidateOnSchema<TElement extends ImpulseForm> =
  | ValidateStrategy
  | ReadonlyArray<GetImpulseFormParam<TElement, "validateOn.schema">>
export type ImpulseFormListValidateOnSchemaVerbose<
  TElement extends ImpulseForm,
> = ReadonlyArray<GetImpulseFormParam<TElement, "validateOn.schema.verbose">>

export type ImpulseFormListValidateOnSetter<TElement extends ImpulseForm> =
  Setter<
    | ValidateStrategy
    | ReadonlyArray<
        undefined | GetImpulseFormParam<TElement, "validateOn.setter">
      >,
    [ImpulseFormListValidateOnSchemaVerbose<TElement>]
  >

export type ImpulseFormListErrorSetter<TElement extends ImpulseForm> = Setter<
  null | ReadonlyArray<
    undefined | GetImpulseFormParam<TElement, "errors.setter">
  >,
  [ImpulseFormListErrorSchemaVerbose<TElement>]
>

export type ImpulseFormListErrorSchema<TElement extends ImpulseForm> =
  null | ReadonlyArray<GetImpulseFormParam<TElement, "errors.schema">>

export type ImpulseFormListErrorSchemaVerbose<TElement extends ImpulseForm> =
  ReadonlyArray<GetImpulseFormParam<TElement, "errors.schema.verbose">>

export interface ImpulseFormListOptions<TElement extends ImpulseForm> {
  // TODO add schema
  touched?: ImpulseFormListFlagSetter<TElement>
  initialValue?: ImpulseFormListOriginalValueSetter<TElement>
  originalValue?: ImpulseFormListOriginalValueSetter<TElement>
  validateOn?: ImpulseFormListValidateOnSetter<TElement>
  errors?: ImpulseFormListErrorSetter<TElement>
}

export class ImpulseFormList<
  TElement extends ImpulseForm = ImpulseForm,
> extends ImpulseForm<{
  "value.schema": ImpulseFormListValueSchema<TElement>
  "value.schema.verbose": ImpulseFormListValueSchemaVerbose<TElement>

  "originalValue.setter": ImpulseFormListOriginalValueSetter<TElement>
  "originalValue.resetter": ImpulseFormListOriginalValueResetter<TElement>
  "originalValue.schema": ImpulseFormListOriginalValueSchema<TElement>

  "flag.setter": ImpulseFormListFlagSetter<TElement>
  "flag.schema": ImpulseFormListFlagSchema<TElement>
  "flag.schema.verbose": ImpulseFormShapeListSchemaVerbose<TElement>

  "validateOn.setter": ImpulseFormListValidateOnSetter<TElement>
  "validateOn.schema": ImpulseFormListValidateOnSchema<TElement>
  "validateOn.schema.verbose": ImpulseFormListValidateOnSchemaVerbose<TElement>

  "errors.setter": ImpulseFormListErrorSetter<TElement>
  "errors.schema": ImpulseFormListErrorSchema<TElement>
  "errors.schema.verbose": ImpulseFormListErrorSchemaVerbose<TElement>
}> {
  public static of<TElement extends ImpulseForm>(
    elements: ReadonlyArray<TElement>,
    {
      touched,
      initialValue,
      originalValue,
      validateOn,
      errors,
    }: ImpulseFormListOptions<TElement> = {},
  ): ImpulseFormList<TElement> {
    const shape = new ImpulseFormList(null, elements)

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

  private readonly _elements: Impulse<ReadonlyArray<TElement>>

  protected constructor(
    root: null | ImpulseForm,
    elements: ReadonlyArray<TElement>,
  ) {
    super(root)

    const elementsWithRoot: ReadonlyArray<TElement> = elements.map(
      (element) => ImpulseForm._cloneWithRoot(this, element) as TElement,
    )

    this._elements = Impulse.of(elementsWithRoot, {
      compare: shallowArrayEquals,
    })
  }

  private _mapFormElements<TLeft, TRight>(
    scope: Scope,
    fn: (form: ImpulseForm) => [TLeft, TRight],
  ): [ReadonlyArray<TLeft>, ReadonlyArray<TRight>] {
    const elements = this._elements.getValue(scope)
    const left = new Array<TLeft>(elements.length)
    const right = new Array<TRight>(elements.length)

    for (const [index, element] of elements.entries()) {
      const [leftItem, rightItem] = fn(element)

      left[index] = leftItem
      right[index] = rightItem
    }

    return [left, right]
  }

  private _setFormElements<
    TElementSetter,
    TElementValue,
    TGenericValue = never,
  >(
    setter: Setter<
      TGenericValue | ReadonlyArray<undefined | TElementSetter>,
      [ReadonlyArray<TElementValue>]
    >,
    getCurrent: (scope: Scope) => ReadonlyArray<TElementValue>,
    setNext: (element: TElement, next: TGenericValue | TElementSetter) => void,
  ): void {
    batch((scope) => {
      const elements = this._elements.getValue(scope)
      const nextInitialValue = isFunction(setter)
        ? setter(getCurrent(scope))
        : setter

      if (isArray(nextInitialValue)) {
        forEach2(
          (element, next) => {
            if (isDefined.strict(next)) {
              setNext(element, next)
            }
          },
          elements,
          nextInitialValue,
        )
      } else {
        for (const element of elements) {
          setNext(element, nextInitialValue)
        }
      }
    })
  }

  protected _submitWith(
    value: ImpulseFormListValueSchema<TElement>,
  ): ReadonlyArray<void | Promise<unknown>> {
    // TODO DRY
    const promises = Object.entries(this.fields).flatMap(([key, field]) => {
      if (!ImpulseForm.isImpulseForm(field)) {
        return []
      }

      return ImpulseForm._submitWith(field, value[key as keyof typeof value])
    })

    return [...super._submitWith(value), ...promises]
  }

  protected _getFocusFirstInvalidValue(): VoidFunction | null {
    // TODO DRY
    // TODO add custom ordering
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

  protected _cloneWithRoot(
    root: null | ImpulseForm,
  ): ImpulseFormList<TElement> {
    return new ImpulseFormList(root, this.fields)
  }

  protected _setValidated(isValidated: boolean): void {
    for (const field of Object.values(this.fields)) {
      if (ImpulseForm.isImpulseForm(field)) {
        ImpulseForm._setValidated(field, isValidated)
      }
    }
  }

  public getElements(scope: Scope): ReadonlyArray<TElement>
  public getElements<TResult>(
    scope: Scope,
    select: (elements: ReadonlyArray<TElement>) => TResult,
  ): TResult
  public getElements<TResult>(
    scope: Scope,
    select: (
      elements: ReadonlyArray<TElement>,
    ) => TResult = identity as typeof select,
  ): TResult {
    return this._elements.getValue(scope, select)
  }

  public getErrors(scope: Scope): ImpulseFormListErrorSchema<TElement>
  public getErrors<TResult>(
    scope: Scope,
    select: (
      concise: ImpulseFormListErrorSchema<TElement>,
      verbose: ImpulseFormListErrorSchemaVerbose<TElement>,
    ) => TResult,
  ): TResult
  public getErrors<TResult = ImpulseFormListErrorSchema<TElement>>(
    scope: Scope,
    select: (
      concise: ImpulseFormListErrorSchema<TElement>,
      verbose: ImpulseFormListErrorSchemaVerbose<TElement>,
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
        : (errorsConcise as unknown as ImpulseFormListErrorSchema<TElement>),
      errorsVerbose as unknown as ImpulseFormListErrorSchemaVerbose<TElement>,
    )
  }

  public setErrors(errors: ImpulseFormListErrorSetter<TElement>): void {
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
      concise: ImpulseFormListFlagSchema<TElement>,
      verbose: ImpulseFormShapeListSchemaVerbose<TElement>,
    ) => TResult,
  ): TResult
  public isValidated<TResult = boolean>(
    scope: Scope,
    select: (
      concise: ImpulseFormListFlagSchema<TElement>,
      verbose: ImpulseFormShapeListSchemaVerbose<TElement>,
    ) => TResult = isTrue as unknown as typeof select,
  ): TResult {
    // TODO DRY
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
      validatedAll
        ? true
        : validatedNone
          ? false
          : (validatedConcise as unknown as ImpulseFormListFlagSchema<TElement>),
      validatedVerbose as unknown as ImpulseFormShapeListSchemaVerbose<TElement>,
    )
  }

  public getValidateOn(scope: Scope): ImpulseFormListValidateOnSchema<TElement>
  public getValidateOn<TResult>(
    scope: Scope,
    select: (
      concise: ImpulseFormListValidateOnSchema<TElement>,
      verbose: ImpulseFormListValidateOnSchemaVerbose<TElement>,
    ) => TResult,
  ): TResult
  public getValidateOn<TResult = ImpulseFormListValidateOnSchema<TElement>>(
    scope: Scope,
    select: (
      concise: ImpulseFormListValidateOnSchema<TElement>,
      verbose: ImpulseFormListValidateOnSchemaVerbose<TElement>,
    ) => TResult = identity as typeof select,
  ): TResult {
    // TODO DRY
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
          : (validateOnConcise as unknown as ImpulseFormListValidateOnSchema<TElement>),
      validateOnVerbose as unknown as ImpulseFormListValidateOnSchemaVerbose<TElement>,
    )
  }

  public setValidateOn(
    setter: ImpulseFormListValidateOnSetter<TElement>,
  ): void {
    this._setFormElements(
      setter,
      (scope) => this.getValidateOn(scope, (_, verbose) => verbose),
      (element, next) => element.setValidateOn(next),
    )
    // batch((scope) => {
    //   const nextValidateOn = isFunction(validateOn)
    //     ? validateOn(this.getValidateOn(scope, (_, verbose) => verbose))
    //     : validateOn

    //   for (const [key, field] of Object.entries(this.fields)) {
    //     const nextFieldTouched = isString(nextValidateOn)
    //       ? nextValidateOn
    //       : nextValidateOn[key as keyof typeof nextValidateOn]

    //     if (
    //       ImpulseForm.isImpulseForm(field) &&
    //       isDefined.strict(nextFieldTouched)
    //     ) {
    //       field.setValidateOn(nextFieldTouched)
    //     }
    //   }
    // })
  }

  public isTouched(scope: Scope): boolean
  public isTouched<TResult>(
    scope: Scope,
    select: (
      concise: ImpulseFormListFlagSchema<TElement>,
      verbose: ImpulseFormShapeListSchemaVerbose<TElement>,
    ) => TResult,
  ): TResult
  public isTouched<TResult = boolean>(
    scope: Scope,
    select: (
      concise: ImpulseFormListFlagSchema<TElement>,
      verbose: ImpulseFormShapeListSchemaVerbose<TElement>,
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
          : (touchedConcise as unknown as ImpulseFormListFlagSchema<TElement>),
      touchedVerbose as unknown as ImpulseFormShapeListSchemaVerbose<TElement>,
    )
  }

  public setTouched(touched: ImpulseFormListFlagSetter<TElement>): void {
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
    resetter: ImpulseFormListOriginalValueResetter<TElement> = identity as typeof resetter,
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
      concise: ImpulseFormListFlagSchema<TElement>,
      verbose: ImpulseFormShapeListSchemaVerbose<TElement>,
    ) => TResult,
  ): TResult
  public isDirty<TResult = boolean>(
    scope: Scope,
    select: (
      concise: ImpulseFormListFlagSchema<TElement>,
      verbose: ImpulseFormShapeListSchemaVerbose<TElement>,
    ) => TResult = isTruthy as unknown as typeof select,
  ): TResult {
    const [valuesConcise, valuesVerbose] = this._mapFormElements(
      scope,
      (form) => form.isDirty(scope, (concise, verbose) => [concise, verbose]),
    )

    return select(
      valuesConcise.every(isFalse)
        ? false
        : valuesConcise.every(isTrue)
          ? true
          : (valuesConcise as ImpulseFormListFlagSchema<TElement>),
      valuesVerbose as ImpulseFormShapeListSchemaVerbose<TElement>,
    )
  }

  public getValue(scope: Scope): null | ImpulseFormListValueSchema<TElement>
  public getValue<TResult>(
    scope: Scope,
    select: (
      concise: null | ImpulseFormListValueSchema<TElement>,
      verbose: ImpulseFormListValueSchemaVerbose<TElement>,
    ) => TResult,
  ): TResult
  public getValue<TResult = null | ImpulseFormListValueSchema<TElement>>(
    scope: Scope,
    select: (
      concise: null | ImpulseFormListValueSchema<TElement>,
      verbose: ImpulseFormListValueSchemaVerbose<TElement>,
    ) => TResult = identity as typeof select,
  ): TResult {
    const [valuesConcise, valuesVerbose] = this._mapFormElements(
      scope,
      (form) => form.getValue(scope, (concise, verbose) => [concise, verbose]),
    )

    return select(
      valuesConcise.some((value) => value === null)
        ? null
        : (valuesConcise as ImpulseFormListValueSchema<TElement>),
      valuesVerbose as ImpulseFormListValueSchemaVerbose<TElement>,
    )
  }

  public getOriginalValue(
    scope: Scope,
  ): ImpulseFormListOriginalValueSchema<TElement> {
    const originalValue = this._elements
      .getValue(scope)
      .map((form) => form.getOriginalValue(scope))

    return originalValue as ImpulseFormListOriginalValueSchema<TElement>
  }

  public setOriginalValue(
    setter: ImpulseFormListOriginalValueSetter<TElement>,
  ): void {
    this._setFormElements(
      setter,
      (scope) => this.getOriginalValue(scope),
      (element, next) => element.setOriginalValue(next),
    )
  }

  public getInitialValue(
    scope: Scope,
  ): ImpulseFormListOriginalValueSchema<TElement> {
    const originalValue = this._elements
      .getValue(scope)
      .map((form) => form.getInitialValue(scope))

    return originalValue as ImpulseFormListOriginalValueSchema<TElement>
  }

  public setInitialValue(
    setter: ImpulseFormListOriginalValueSetter<TElement>,
  ): void {
    this._setFormElements(
      setter,
      (scope) => this.getInitialValue(scope),
      (element, next) => element.setInitialValue(next),
    )
  }
}
