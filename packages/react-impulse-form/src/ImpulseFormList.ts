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
  isNull,
  params,
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

  private readonly _elements: Impulse<ReadonlyArray<TElement>>
  private readonly _initialElements: Impulse<ReadonlyArray<TElement>>

  protected constructor(
    root: null | ImpulseForm,
    _elements: Impulse<ReadonlyArray<TElement>>,
    _initialElements: Impulse<ReadonlyArray<TElement>> = _elements,
  ) {
    super(root)

    this._initialElements = _initialElements.clone((elements) => {
      return elements.map((element) => {
        return ImpulseForm._childOf(this, element)
      })
    })

    this._elements = _elements.clone((elements) => {
      const initialElements = untrack(this._initialElements)

      return elements.map((element, index) => {
        const child = ImpulseForm._childOf(this, element)
        const initial = initialElements.at(index)

        if (isDefined.strict(initial)) {
          ImpulseForm._setInitial(child, initial)
        }

        return child
      })
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

  protected _childOf(parent: null | ImpulseForm): ImpulseFormList<TElement> {
    return new ImpulseFormList(
      parent,
      this._elements.clone(),
      this._initialElements.clone(),
    )
  }

  protected _setInitial(
    initial: undefined | ImpulseFormList<TElement>,
    isRoot: boolean,
  ): void {
    const initialElements = untrack(
      (scope) => initial?._initialElements.getValue(scope) ?? [],
    )

    for (const [index, element] of untrack(this._elements).entries()) {
      ImpulseForm._setInitial(element, initialElements.at(index), isRoot)
    }
  }

  protected _setValidated(isValidated: boolean): void {
    for (const element of untrack(this._elements)) {
      ImpulseForm._setValidated(element, isValidated)
    }
  }

  /**
   * Returns `true` if at least one of the form elements is dirty,
   * or when elements array is modified (added, removed, or reordered).
   */
  protected _isDirty<TResult>(
    scope: Scope,
    initial: ImpulseFormList<TElement>,
    select: (
      concise: ImpulseFormListFlagSchema<TElement>,
      verbose: ImpulseFormListFlagSchemaVerbose<TElement>,
      dirty: ImpulseFormListFlagSchemaVerbose<TElement>,
    ) => TResult,
  ): TResult {
    const elements = this._elements.getValue(scope)
    const initialElements = initial._initialElements.getValue(scope)

    const [concise, verbose, dirty] = zipMap(
      // the result should always include the longer array
      elements.length >= initialElements.length
        ? elements
        : // fill the shorter elements with initial elements
          [...elements, ...initialElements.slice(elements.length)],
      (form, index) => {
        // return actual dirty state as long as iterates over elements
        if (index < initialElements.length && index < elements.length) {
          return ImpulseForm._isDirty(
            scope,
            form,
            initialElements.at(index)!,
            params,
          )
        }

        // otherwise, fallback to hardcoded dirty state
        const dirt = ImpulseForm._isDirty(scope, form, form, params._third)

        return [true, dirt, dirt]
      },
    ) as [
      Exclude<ImpulseFormListFlagSchema<TElement>, boolean>,
      ImpulseFormListFlagSchemaVerbose<TElement>,
      ImpulseFormListFlagSchemaVerbose<TElement>,
    ]

    if (concise.every(isFalse)) {
      return select(false, verbose, dirty)
    }

    if (concise.every(isTrue)) {
      return select(true, verbose, dirty)
    }

    return select(concise, verbose, dirty)
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
      const initialElements = this._initialElements.getValue(scope)
      const updatedElements = resolveSetter(setter, elements, scope)

      for (const [index, element] of updatedElements.entries()) {
        ImpulseForm._setInitial(element, initialElements.at(index))
      }

      return updatedElements.map((element) => {
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
    const [concise, verbose] = zipMap(
      //
      this._elements.getValue(scope),
      (form) => form.getErrors(scope, params),
    ) as [
      Exclude<ImpulseFormListErrorSchema<TElement>, null>,
      ImpulseFormListErrorSchemaVerbose<TElement>,
    ]

    if (concise.every(isNull)) {
      return select(null, verbose)
    }

    return select(concise, verbose)
  }

  public setErrors(setter: ImpulseFormListErrorSetter<TElement>): void {
    setFormElements(
      this._elements,
      setter,
      (scope) => [this.getErrors(scope, params._second)],
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
    const [concise, verbose] = zipMap(
      //
      this._elements.getValue(scope),
      (form) => form.isValidated(scope, params),
    ) as [
      Exclude<ImpulseFormListFlagSchema<TElement>, boolean>,
      ImpulseFormListFlagSchemaVerbose<TElement>,
    ]

    if (concise.every(isFalse)) {
      return select(false, verbose)
    }

    if (concise.every(isTrue)) {
      return select(true, verbose)
    }

    return select(concise, verbose)
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
    const [concise, verbose] = zipMap(
      //
      this._elements.getValue(scope),
      (form) => form.getValidateOn(scope, params),
    ) as [
      Exclude<ImpulseFormListValidateOnSchema<TElement>, ValidateStrategy>,
      ImpulseFormListValidateOnSchemaVerbose<TElement>,
    ]

    // defaults to "onTouch"
    if (concise.length === 0) {
      return select(VALIDATE_ON_TOUCH, verbose)
    }

    if (concise.every(isString) && uniq(concise).length === 1) {
      return select(concise[0] as ValidateStrategy, verbose)
    }

    return select(concise, verbose)
  }

  public setValidateOn(
    setter: ImpulseFormListValidateOnSetter<TElement>,
  ): void {
    batch(() => {
      setFormElements(
        this._elements,
        setter,
        (scope) => [this.getValidateOn(scope, params._second)],
        (element, next) => element.setValidateOn(next),
      )

      setFormElements(
        this._initialElements,
        setter,
        (scope) => [this.getValidateOn(scope, params._second)],
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
    const [concise, verbose] = zipMap(
      //
      this._elements.getValue(scope),
      (form) => form.isTouched(scope, params),
    ) as [
      Exclude<ImpulseFormListFlagSchema<TElement>, boolean>,
      ImpulseFormListFlagSchemaVerbose<TElement>,
    ]

    if (concise.every(isFalse)) {
      return select(false, verbose)
    }

    if (concise.every(isTrue)) {
      return select(true, verbose)
    }

    return select(concise, verbose)
  }

  public setTouched(setter: ImpulseFormListFlagSetter<TElement>): void {
    setFormElements(
      this._elements,
      setter,
      (scope) => [this.isTouched(scope, params._second)],
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
    const [concise, verbose] = zipMap(
      //
      this._elements.getValue(scope),
      (form) => form.getValue(scope, params),
    ) as [
      ImpulseFormListValueSchema<TElement>,
      ImpulseFormListValueSchemaVerbose<TElement>,
    ]

    return select(concise.some(isNull) ? null : concise, verbose)
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
