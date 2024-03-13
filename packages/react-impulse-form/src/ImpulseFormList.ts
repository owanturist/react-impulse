import {
  type Scope,
  batch,
  identity,
  isFunction,
  isTruthy,
  isDefined,
  isString,
  isArray,
  Impulse,
  untrack,
} from "./dependencies"
import {
  type Setter,
  forEach2,
  isTrue,
  shallowArrayEquals,
  isFalse,
  uniq,
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
    const shape = new ImpulseFormList(
      null,
      Impulse.of(elements, {
        compare: shallowArrayEquals,
      }),
    )

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

  protected constructor(
    root: null | ImpulseForm,
    private readonly _elements: Impulse<ReadonlyArray<TElement>>,
  ) {
    super(root)

    this._elements.setValue((elements) => {
      return elements.map(
        (element) => ImpulseForm._cloneWithRoot(this, element) as TElement,
      )
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
    TElementValueLeft,
    TElementValueRight,
    TGenericValue = never,
  >(
    setter: Setter<
      TGenericValue | ReadonlyArray<undefined | TElementSetter>,
      [TElementValueLeft, TElementValueRight]
    >,
    getCurrent: (scope: Scope) => [TElementValueLeft, TElementValueRight],
    setNext: (element: TElement, next: TGenericValue | TElementSetter) => void,
  ): void

  private _setFormElements<
    TElementSetter,
    TElementValue,
    TGenericValue = never,
  >(
    setter: Setter<
      TGenericValue | ReadonlyArray<undefined | TElementSetter>,
      [TElementValue]
    >,
    getCurrent: (scope: Scope) => [TElementValue],
    setNext: (element: TElement, next: TGenericValue | TElementSetter) => void,
  ): void

  private _setFormElements<
    TElementSetter,
    TElementValueLeft,
    TElementValueRight,
    TGenericValue = never,
  >(
    setter: Setter<
      TGenericValue | ReadonlyArray<undefined | TElementSetter>,
      [TElementValueLeft, TElementValueRight?]
    >,
    getCurrent: (scope: Scope) => [TElementValueLeft, TElementValueRight?],
    setNext: (element: TElement, next: TGenericValue | TElementSetter) => void,
  ): void {
    batch((scope) => {
      const elements = this._elements.getValue(scope)
      const nextInitialValue = isFunction(setter)
        ? setter(...getCurrent(scope))
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
    const promises = untrack(this._elements).flatMap((element, index) => {
      return ImpulseForm._submitWith(element, value[index])
    })

    return [...super._submitWith(value), ...promises]
  }

  protected _getFocusFirstInvalidValue(): VoidFunction | null {
    for (const element of untrack(this._elements)) {
      const focus = ImpulseForm._getFocusFirstInvalidValue(element)

      if (focus != null) {
        return focus
      }
    }

    return null
  }

  protected _cloneWithRoot(
    root: null | ImpulseForm,
  ): ImpulseFormList<TElement> {
    return new ImpulseFormList(root, this._elements.clone())
  }

  protected _setValidated(isValidated: boolean): void {
    for (const element of untrack(this._elements)) {
      ImpulseForm._setValidated(element, isValidated)
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
    const [errorsConcise, errorsVerbose] = this._mapFormElements(
      scope,
      (form) => form.getErrors(scope, (concise, verbose) => [concise, verbose]),
    )

    return select(
      errorsConcise.every((errors) => errors === null)
        ? null
        : (errorsConcise as ImpulseFormListErrorSchema<TElement>),
      errorsVerbose as ImpulseFormListErrorSchemaVerbose<TElement>,
    )
  }

  public setErrors(setter: ImpulseFormListErrorSetter<TElement>): void {
    this._setFormElements(
      setter,
      (scope) => [this.getErrors(scope, (_, verbose) => verbose)],
      (element, next) => element.setErrors(next),
    )
  }

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
    const [validatedConcise, valueVerbose] = this._mapFormElements(
      scope,
      (form) =>
        form.isValidated(scope, (concise, verbose) => [concise, verbose]),
    )

    return select(
      validatedConcise.every(isFalse)
        ? false
        : validatedConcise.every(isTrue)
          ? true
          : (validatedConcise as ImpulseFormListFlagSchema<TElement>),
      valueVerbose as ImpulseFormShapeListSchemaVerbose<TElement>,
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
    const [validateOnConcise, validateOnVerbose] = this._mapFormElements(
      scope,
      (form) => {
        return form.getValidateOn(scope, (concise, verbose) => [
          concise,
          verbose,
        ])
      },
    )

    return select(
      validateOnConcise.length === 0
        ? // defaults to "onTouch"
          VALIDATE_ON_TOUCH
        : validateOnConcise.every(isString) &&
            uniq(validateOnConcise).length === 1
          ? (validateOnConcise[0] as ValidateStrategy)
          : (validateOnConcise as ImpulseFormListValidateOnSchema<TElement>),
      validateOnVerbose as ImpulseFormListValidateOnSchemaVerbose<TElement>,
    )
  }

  public setValidateOn(
    setter: ImpulseFormListValidateOnSetter<TElement>,
  ): void {
    this._setFormElements(
      setter,
      (scope) => [this.getValidateOn(scope, (_, verbose) => verbose)],
      (element, next) => element.setValidateOn(next),
    )
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
    const [touchedConcise, touchedVerbose] = this._mapFormElements(
      scope,
      (form) => form.isTouched(scope, (concise, verbose) => [concise, verbose]),
    )

    return select(
      touchedConcise.every(isFalse)
        ? false
        : touchedConcise.every(isTrue)
          ? true
          : (touchedConcise as ImpulseFormListFlagSchema<TElement>),
      touchedVerbose as ImpulseFormShapeListSchemaVerbose<TElement>,
    )
  }

  public setTouched(setter: ImpulseFormListFlagSetter<TElement>): void {
    this._setFormElements(
      setter,
      (scope) => [this.isTouched(scope, (_, verbose) => verbose)],
      (element, next) => element.setTouched(next),
    )
  }

  public reset(
    resetter: ImpulseFormListOriginalValueResetter<TElement> = identity as typeof resetter,
  ): void {
    this._setFormElements(
      resetter,
      (scope) => [this.getInitialValue(scope), this.getOriginalValue(scope)],
      (element, next) => element.reset(next),
    )
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
    const [dirtyConcise, dirtyVerbose] = this._mapFormElements(scope, (form) =>
      form.isDirty(scope, (concise, verbose) => [concise, verbose]),
    )

    return select(
      dirtyConcise.every(isFalse)
        ? false
        : dirtyConcise.every(isTrue)
          ? true
          : (dirtyConcise as ImpulseFormListFlagSchema<TElement>),
      dirtyVerbose as ImpulseFormShapeListSchemaVerbose<TElement>,
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
      (scope) => [this.getOriginalValue(scope)],
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
      (scope) => [this.getInitialValue(scope)],
      (element, next) => element.setInitialValue(next),
    )
  }
}
