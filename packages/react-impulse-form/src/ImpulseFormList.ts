import {
  type Scope,
  batch,
  identity,
  isTruthy,
  isDefined,
  isString,
  isArray,
  Impulse,
  untrack,
} from "./dependencies"
import {
  type Setter,
  isTrue,
  shallowArrayEquals,
  isFalse,
  uniq,
  resolveSetter,
  zipMap,
  arrayEqualsBy,
} from "./utils"
import { type GetImpulseFormParam, ImpulseForm } from "./ImpulseForm"
import { VALIDATE_ON_TOUCH, type ValidateStrategy } from "./ValidateStrategy"

function setFormElements<
  TElement extends ImpulseForm,
  TElementSetter,
  TElementValueLeft,
  TElementValueRight,
  TGenericValue = never,
>(
  elements: Impulse<ReadonlyArray<TElement>>,
  setter: Setter<
    TGenericValue | ReadonlyArray<undefined | TElementSetter>,
    [TElementValueLeft, TElementValueRight]
  >,
  getCurrent: (scope: Scope) => [TElementValueLeft, TElementValueRight],
  setNext: (element: TElement, next: TGenericValue | TElementSetter) => void,
): void

function setFormElements<
  TElement extends ImpulseForm,
  TElementSetter,
  TElementValue,
  TGenericValue = never,
>(
  elements: Impulse<ReadonlyArray<TElement>>,
  setter: Setter<
    TGenericValue | ReadonlyArray<undefined | TElementSetter>,
    [TElementValue]
  >,
  getCurrent: (scope: Scope) => [TElementValue],
  setNext: (element: TElement, next: TGenericValue | TElementSetter) => void,
): void

function setFormElements<
  TElement extends ImpulseForm,
  TElementSetter,
  TElementValueLeft,
  TElementValueRight,
  TGenericValue = never,
>(
  elements: Impulse<ReadonlyArray<TElement>>,
  setter: Setter<
    TGenericValue | ReadonlyArray<undefined | TElementSetter>,
    [TElementValueLeft, TElementValueRight?]
  >,
  getCurrent: (scope: Scope) => [TElementValueLeft, TElementValueRight?],
  setNext: (element: TElement, next: TGenericValue | TElementSetter) => void,
): void {
  batch((scope) => {
    const nextValue = resolveSetter(setter, ...getCurrent(scope))

    for (const [index, element] of elements.getValue(scope).entries()) {
      const next = isArray(nextValue) ? nextValue.at(index) : nextValue

      if (isDefined.strict(next)) {
        setNext(element, next)
      }
    }
  })
}

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
    [
      ImpulseFormListOriginalValueSchema<TElement>,
      ImpulseFormListOriginalValueSchema<TElement>,
    ]
  >

export type ImpulseFormListFlagSchema<TElement extends ImpulseForm> =
  | boolean
  | ReadonlyArray<GetImpulseFormParam<TElement, "flag.schema">>

export type ImpulseFormListFlagSchemaVerbose<TElement extends ImpulseForm> =
  ReadonlyArray<GetImpulseFormParam<TElement, "flag.schema.verbose">>

export type ImpulseFormListFlagSetter<TElement extends ImpulseForm> = Setter<
  | boolean
  | ReadonlyArray<undefined | GetImpulseFormParam<TElement, "flag.setter">>,
  [ImpulseFormListFlagSchemaVerbose<TElement>]
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
  "originalValue.schema": ImpulseFormListOriginalValueSchema<TElement>

  "flag.setter": ImpulseFormListFlagSetter<TElement>
  "flag.schema": ImpulseFormListFlagSchema<TElement>
  "flag.schema.verbose": ImpulseFormListFlagSchemaVerbose<TElement>

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
    const list = new ImpulseFormList(
      null,
      Impulse.of(elements, {
        compare: shallowArrayEquals,
      }),
    )

    batch(() => {
      if (isDefined.strict(touched)) {
        list.setTouched(touched)
      }

      if (isDefined.strict(initialValue)) {
        list.setInitialValue(initialValue)
      }

      if (isDefined.strict(originalValue)) {
        list.setOriginalValue(originalValue)
      }

      if (isDefined(validateOn)) {
        list.setValidateOn(validateOn)
      }

      // TODO add test against null
      if (isDefined.strict(errors)) {
        list.setErrors(errors)
      }
    })

    return list
  }

  private readonly _initialElements: Impulse<ReadonlyArray<TElement>>

  protected constructor(
    root: null | ImpulseForm,
    private readonly _elements: Impulse<ReadonlyArray<TElement>>,
    _initialElements?: Impulse<ReadonlyArray<TElement>>,
  ) {
    super(root)

    _elements.setValue((elements) => {
      return elements.map((element) => ImpulseForm._childOf(this, element))
    })

    this._initialElements = _initialElements ?? _elements.clone()
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

  protected _childOf(parent: null | ImpulseForm): ImpulseFormList<TElement> {
    return new ImpulseFormList(
      parent,
      this._elements.clone(),
      this._initialElements.clone(),
    )
  }

  protected _setValidated(isValidated: boolean): void {
    for (const element of untrack(this._elements)) {
      ImpulseForm._setValidated(element, isValidated)
    }
  }

  protected _isDirtyAgainst(
    scope: Scope,
    initial: ImpulseFormList<TElement>,
  ): boolean {
    const originalElements = this._elements.getValue(scope)
    const initialElements = initial._elements.getValue(scope)

    if (originalElements.length !== initialElements.length) {
      return false
    }

    for (const [index, originalElement] of originalElements.entries()) {
      const initialElement = initialElements[index]!

      if (
        ImpulseForm.isImpulseForm(originalElement) &&
        ImpulseForm.isImpulseForm(initialElement) &&
        !ImpulseForm._isDirtyAgainst(scope, originalElement, initialElement)
      ) {
        return false
      }
    }

    return true
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

  public setElements(
    setter: Setter<ReadonlyArray<TElement>, [ReadonlyArray<TElement>, Scope]>,
  ): void {
    this._elements.setValue((elements, scope) => {
      return resolveSetter(setter, elements, scope).map((element) => {
        return ImpulseForm._childOf(this, element)
      })
    })
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
    const [errorsConcise, errorsVerbose] = zipMap(
      this._elements.getValue(scope),
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
    setFormElements(
      this._elements,
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
      verbose: ImpulseFormListFlagSchemaVerbose<TElement>,
    ) => TResult,
  ): TResult
  public isValidated<TResult = boolean>(
    scope: Scope,
    select: (
      concise: ImpulseFormListFlagSchema<TElement>,
      verbose: ImpulseFormListFlagSchemaVerbose<TElement>,
    ) => TResult = isTrue as unknown as typeof select,
  ): TResult {
    const [validatedConcise, valueVerbose] = zipMap(
      this._elements.getValue(scope),
      (form) =>
        form.isValidated(scope, (concise, verbose) => [concise, verbose]),
    )

    return select(
      validatedConcise.every(isFalse)
        ? false
        : validatedConcise.every(isTrue)
          ? true
          : (validatedConcise as ImpulseFormListFlagSchema<TElement>),
      valueVerbose as ImpulseFormListFlagSchemaVerbose<TElement>,
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
    const [validateOnConcise, validateOnVerbose] = zipMap(
      this._elements.getValue(scope),
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
    batch(() => {
      setFormElements(
        this._elements,
        setter,
        (scope) => [this.getValidateOn(scope, (_, verbose) => verbose)],
        (element, next) => element.setValidateOn(next),
      )
      setFormElements(
        this._initialElements,
        setter,
        (scope) => [this.getValidateOn(scope, (_, verbose) => verbose)],
        (element, next) => element.setValidateOn(next),
      )
    })
  }

  public isTouched(scope: Scope): boolean
  public isTouched<TResult>(
    scope: Scope,
    select: (
      concise: ImpulseFormListFlagSchema<TElement>,
      verbose: ImpulseFormListFlagSchemaVerbose<TElement>,
    ) => TResult,
  ): TResult
  public isTouched<TResult = boolean>(
    scope: Scope,
    select: (
      concise: ImpulseFormListFlagSchema<TElement>,
      verbose: ImpulseFormListFlagSchemaVerbose<TElement>,
    ) => TResult = isTruthy as unknown as typeof select,
  ): TResult {
    const [touchedConcise, touchedVerbose] = zipMap(
      this._elements.getValue(scope),
      (form) => form.isTouched(scope, (concise, verbose) => [concise, verbose]),
    )

    return select(
      touchedConcise.every(isFalse)
        ? false
        : touchedConcise.every(isTrue)
          ? true
          : (touchedConcise as ImpulseFormListFlagSchema<TElement>),
      touchedVerbose as ImpulseFormListFlagSchemaVerbose<TElement>,
    )
  }

  public setTouched(setter: ImpulseFormListFlagSetter<TElement>): void {
    setFormElements(
      this._elements,
      setter,
      (scope) => [this.isTouched(scope, (_, verbose) => verbose)],
      (element, next) => element.setTouched(next),
    )
  }

  public reset(
    resetter: ImpulseFormListOriginalValueSetter<TElement> = identity as typeof resetter,
  ): void {
    batch((scope) => {
      this.setInitialValue(resetter)

      const initialElements = this._initialElements.getValue(scope)

      this._elements.setValue(initialElements)

      for (const element of initialElements) {
        element.reset()
      }
    })
  }

  /**
   * Returns `true` if at least one of the form elements is dirty,
   * or when at elements array is modified (added, removed, or reordered).
   */
  public isDirty(scope: Scope): boolean
  public isDirty<TResult>(
    scope: Scope,
    select: (
      concise: ImpulseFormListFlagSchema<TElement>,
      verbose: ImpulseFormListFlagSchemaVerbose<TElement>,
    ) => TResult,
  ): TResult
  public isDirty<TResult>(
    scope: Scope,
    select: (
      concise: ImpulseFormListFlagSchema<TElement>,
      verbose: ImpulseFormListFlagSchemaVerbose<TElement>,
    ) => TResult = isTruthy as unknown as typeof select,
  ): TResult {
    const initialElements = this._initialElements.getValue(scope)
    const elements = this._elements.getValue(scope)

    const [dirtyConcise, dirtyVerbose] = zipMap(
      this._elements.getValue(scope),
      (form) => form.isDirty(scope, (concise, verbose) => [concise, verbose]),
    ) as [
      Exclude<ImpulseFormListFlagSchema<TElement>, boolean>,
      ImpulseFormListFlagSchemaVerbose<TElement>,
    ]

    const areElementEqual = arrayEqualsBy(
      elements,
      initialElements,
      (original, initial) =>
        ImpulseForm._isDirtyAgainst(scope, original, initial),
    )

    if (!areElementEqual) {
      return select(true, dirtyVerbose)
    }

    if (dirtyConcise.every(isFalse)) {
      return select(false, dirtyVerbose)
    }

    if (dirtyConcise.every(isTrue)) {
      return select(true, dirtyVerbose)
    }

    return select(dirtyConcise, dirtyVerbose)
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
    const [valuesConcise, valuesVerbose] = zipMap(
      this._elements.getValue(scope),
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
    setFormElements(
      this._elements,
      setter,
      (scope) => [this.getOriginalValue(scope), this.getInitialValue(scope)],
      (element, next) => element.setOriginalValue(next),
    )
  }

  public getInitialValue(
    scope: Scope,
  ): ImpulseFormListOriginalValueSchema<TElement> {
    const initialValue = this._initialElements
      .getValue(scope)
      .map((form) => form.getInitialValue(scope))

    return initialValue as ImpulseFormListOriginalValueSchema<TElement>
  }

  public setInitialValue(
    setter: ImpulseFormListOriginalValueSetter<TElement>,
  ): void {
    batch((scope) => {
      // get next initial value from setter (initial, original) -> next
      const nextInitialValue = resolveSetter(
        setter,
        this.getInitialValue(scope),
        this.getOriginalValue(scope),
      )

      const elements = this._elements
        .getValue(scope)
        .slice(0, nextInitialValue.length)

      const initialElements = [
        ...elements,
        // restore initial elements that were removed from the elements
        ...this._initialElements
          .getValue(scope)
          .slice(elements.length, nextInitialValue.length),
      ]

      // set list's initial elements
      this._initialElements.setValue(initialElements)

      // set initial values for each element
      for (const [index, element] of initialElements.entries()) {
        const initialValue = nextInitialValue.at(index)

        // do not change initial value if it is not defined
        if (isDefined.strict(initialValue)) {
          element.setInitialValue(initialValue)
        }
      }
    })
  }
}
