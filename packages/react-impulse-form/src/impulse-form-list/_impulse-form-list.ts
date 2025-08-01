import { concat } from "~/tools/concat"
import { drop } from "~/tools/drop"
import { isFalse } from "~/tools/is-false"
import { isFunction } from "~/tools/is-function"
import { isNull } from "~/tools/is-null"
import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"
import { isString } from "~/tools/is-string"
import { isTrue } from "~/tools/is-true"
import { isTruthy } from "~/tools/is-truthy"
import { isUndefined } from "~/tools/is-undefined"
import { params } from "~/tools/params"
import { type Setter, resolveSetter } from "~/tools/setter"
import { take } from "~/tools/take"
import { uniq } from "~/tools/uniq"
import { zipMap } from "~/tools/zip-map"

import { Impulse, type Scope, batch, untrack } from "../dependencies"
import { ImpulseForm } from "../impulse-form"
import { VALIDATE_ON_TOUCH, type ValidateStrategy } from "../validate-strategy"

import { setListFormElements } from "./_set-list-form-elements"
import type { ImpulseFormListError } from "./impulse-form-list-error"
import type { ImpulseFormListErrorSetter } from "./impulse-form-list-error-setter"
import type { ImpulseFormListErrorVerbose } from "./impulse-form-list-error-verbose"
import type { ImpulseFormListFlag } from "./impulse-form-list-flag"
import type { ImpulseFormListFlagSetter } from "./impulse-form-list-flag-setter"
import type { ImpulseFormListFlagVerbose } from "./impulse-form-list-flag-verbose"
import type { ImpulseFormListInitial } from "./impulse-form-list-initial"
import type { ImpulseFormListInput } from "./impulse-form-list-input"
import type { ImpulseFormListInputSetter } from "./impulse-form-list-input-setter"
import type { ImpulseFormListOutput } from "./impulse-form-list-output"
import type { ImpulseFormListOutputVerbose } from "./impulse-form-list-output-verbose"
import type { ImpulseFormListValidateOn } from "./impulse-form-list-validate-on"
import type { ImpulseFormListValidateOnSetter } from "./impulse-form-list-validate-on-setter"
import type { ImpulseFormListValidateOnVerbose } from "./impulse-form-list-validate-on-verbose"

export class ImpulseFormList<
  TElement extends ImpulseForm = ImpulseForm,
> extends ImpulseForm<{
  initial: ImpulseFormListInitial<TElement>
  "input.schema": ImpulseFormListInput<TElement>
  "input.setter": ImpulseFormListInputSetter<TElement>

  "output.schema": ImpulseFormListOutput<TElement>
  "output.schema.verbose": ImpulseFormListOutputVerbose<TElement>

  "flag.setter": ImpulseFormListFlagSetter<TElement>
  "flag.schema": ImpulseFormListFlag<TElement>
  "flag.schema.verbose": ImpulseFormListFlagVerbose<TElement>

  "validateOn.setter": ImpulseFormListValidateOnSetter<TElement>
  "validateOn.schema": ImpulseFormListValidateOn<TElement>
  "validateOn.schema.verbose": ImpulseFormListValidateOnVerbose<TElement>

  "error.setter": ImpulseFormListErrorSetter<TElement>
  "error.schema": ImpulseFormListError<TElement>
  "error.schema.verbose": ImpulseFormListErrorVerbose<TElement>
}> {
  private readonly _elements: Impulse<ReadonlyArray<TElement>>
  private readonly _initialElements: Impulse<ReadonlyArray<TElement>>

  public constructor(
    root: null | ImpulseForm,
    elements: ReadonlyArray<TElement>,
    protected readonly _initial: ImpulseFormListInitial<TElement>,
  ) {
    super(root)

    const initial = untrack(this._initial)

    this._initialElements = Impulse(
      elements.map((element, index) => {
        return ImpulseForm._childOf(
          this,
          initial.at(index) ?? element._getInitial(),
          element,
        )
      }),
      {
        compare: isShallowArrayEqual,
      },
    )

    this._elements = Impulse(
      elements.map((element, index) => {
        return ImpulseForm._childOf(
          this,
          initial.at(index) ?? element._getInitial(),
          element,
        )
      }),
      {
        compare: isShallowArrayEqual,
      },
    )
  }

  protected override _submitWith(
    output: ImpulseFormListOutput<TElement>,
  ): ReadonlyArray<void | Promise<unknown>> {
    const promises = untrack(this._elements).flatMap((element, index) => {
      return ImpulseForm._submitWith(element, output[index])
    })

    return [...super._submitWith(output), ...promises]
  }

  protected override _getFocusFirstInvalid(scope: Scope): VoidFunction | null {
    for (const element of this._elements.getValue(scope)) {
      const focus = ImpulseForm._getFocusFirstInvalid(scope, element)

      if (focus != null) {
        return focus
      }
    }

    return super._getFocusFirstInvalid(scope)
  }

  protected _childOf(
    args: null | [ImpulseForm, ImpulseFormListInitial<TElement>],
  ): ImpulseFormList<TElement> {
    return new ImpulseFormList(
      args?.[0] ?? null,
      untrack(this._elements),
      args?.[1] ?? this._getInitial(),
    )
  }

  protected _getInitial(): ImpulseFormListInitial<TElement> {
    return this._elements.clone((elements) => {
      return elements.map((element) => element._getInitial())
    })
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
    select: (
      concise: ImpulseFormListFlag<TElement>,
      verbose: ImpulseFormListFlagVerbose<TElement>,
      dirty: ImpulseFormListFlagVerbose<TElement>,
    ) => TResult,
  ): TResult {
    const elements = this._elements.getValue(scope)
    const initialElements = this._initialElements.getValue(scope)
    const minLength = Math.min(elements.length, initialElements.length)

    const [concise, verbose, dirty] = zipMap(
      // the result should always include the longer array
      [...elements, ...drop(initialElements, elements.length)],
      (form, index) => {
        // return actual dirty state as long as iterates over elements
        if (index < minLength) {
          return ImpulseForm._isDirty(scope, form, params)
        }

        // otherwise, fallback to hardcoded verbose dirty state
        const dirt = ImpulseForm._isDirty(scope, form, params._third)

        return [true, dirt, dirt]
      },
    ) as [
      Exclude<ImpulseFormListFlag<TElement>, boolean>,
      ImpulseFormListFlagVerbose<TElement>,
      ImpulseFormListFlagVerbose<TElement>,
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
    ) => TResult = params._first as typeof select,
  ): TResult {
    return select(this._elements.getValue(scope))
  }

  public setElements(
    setter: Setter<ReadonlyArray<TElement>, [ReadonlyArray<TElement>, Scope]>,
  ): void {
    this._elements.setValue((elements, scope) => {
      const initial = this._initial.getValue(scope)
      const updatedElements = resolveSetter(setter, elements, scope)

      return updatedElements.map((element, index) => {
        return ImpulseForm._childOf(
          this,
          initial.at(index) ?? element._getInitial(),
          element,
        )
      })
    })
  }

  public getError(scope: Scope): ImpulseFormListError<TElement>
  public getError<TResult>(
    scope: Scope,
    select: (
      concise: ImpulseFormListError<TElement>,
      verbose: ImpulseFormListErrorVerbose<TElement>,
    ) => TResult,
  ): TResult
  public getError<TResult = ImpulseFormListError<TElement>>(
    scope: Scope,
    select: (
      concise: ImpulseFormListError<TElement>,
      verbose: ImpulseFormListErrorVerbose<TElement>,
    ) => TResult = params._first as typeof select,
  ): TResult {
    const [concise, verbose] = zipMap(
      //
      this._elements.getValue(scope),
      (form) => form.getError(scope, params),
    ) as [
      Exclude<ImpulseFormListError<TElement>, null>,
      ImpulseFormListErrorVerbose<TElement>,
    ]

    if (concise.every(isNull)) {
      return select(null, verbose)
    }

    return select(concise, verbose)
  }

  public setError(setter: ImpulseFormListErrorSetter<TElement>): void {
    setListFormElements(
      this._elements,
      setter,
      (scope) => [this.getError(scope, params._second)],
      (element, next) => element.setError(next),
    )
  }

  public isValidated(scope: Scope): boolean

  public isValidated<TResult>(
    scope: Scope,
    select: (
      concise: ImpulseFormListFlag<TElement>,
      verbose: ImpulseFormListFlagVerbose<TElement>,
    ) => TResult,
  ): TResult
  public isValidated<TResult = boolean>(
    scope: Scope,
    select: (
      concise: ImpulseFormListFlag<TElement>,
      verbose: ImpulseFormListFlagVerbose<TElement>,
    ) => TResult = isTrue as unknown as typeof select,
  ): TResult {
    const [concise, verbose] = zipMap(
      //
      this._elements.getValue(scope),
      (form) => form.isValidated(scope, params),
    ) as [
      Exclude<ImpulseFormListFlag<TElement>, boolean>,
      ImpulseFormListFlagVerbose<TElement>,
    ]

    if (concise.every(isFalse)) {
      return select(false, verbose)
    }

    if (concise.every(isTrue)) {
      return select(true, verbose)
    }

    return select(concise, verbose)
  }

  public getValidateOn(scope: Scope): ImpulseFormListValidateOn<TElement>
  public getValidateOn<TResult>(
    scope: Scope,
    select: (
      concise: ImpulseFormListValidateOn<TElement>,
      verbose: ImpulseFormListValidateOnVerbose<TElement>,
    ) => TResult,
  ): TResult
  public getValidateOn<TResult = ImpulseFormListValidateOn<TElement>>(
    scope: Scope,
    select: (
      concise: ImpulseFormListValidateOn<TElement>,
      verbose: ImpulseFormListValidateOnVerbose<TElement>,
    ) => TResult = params._first as typeof select,
  ): TResult {
    const [concise, verbose] = zipMap(
      //
      this._elements.getValue(scope),
      (form) => form.getValidateOn(scope, params),
    ) as [
      Exclude<ImpulseFormListValidateOn<TElement>, ValidateStrategy>,
      ImpulseFormListValidateOnVerbose<TElement>,
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
      setListFormElements(
        this._elements,
        setter,
        (scope) => [this.getValidateOn(scope, params._second)],
        (element, next) => element.setValidateOn(next),
      )

      setListFormElements(
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
      concise: ImpulseFormListFlag<TElement>,
      verbose: ImpulseFormListFlagVerbose<TElement>,
    ) => TResult,
  ): TResult
  public isTouched<TResult = boolean>(
    scope: Scope,
    select: (
      concise: ImpulseFormListFlag<TElement>,
      verbose: ImpulseFormListFlagVerbose<TElement>,
    ) => TResult = isTruthy as unknown as typeof select,
  ): TResult {
    const [concise, verbose] = zipMap(
      //
      this._elements.getValue(scope),
      (form) => form.isTouched(scope, params),
    ) as [
      Exclude<ImpulseFormListFlag<TElement>, boolean>,
      ImpulseFormListFlagVerbose<TElement>,
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
    setListFormElements(
      this._elements,
      setter,
      (scope) => [this.isTouched(scope, params._second)],
      (element, next) => element.setTouched(next),
    )
  }

  public reset(
    resetter: ImpulseFormListInputSetter<TElement> = params._first as typeof resetter,
  ): void {
    batch((scope) => {
      this.setInitial(resetter)

      const initialElements = this._initialElements
        .getValue(scope)
        .map((element) => ImpulseForm._childOf(this, element))

      this._elements.setValue(initialElements)

      for (const element of initialElements) {
        element.reset()
      }
    })
  }

  public getOutput(scope: Scope): null | ImpulseFormListOutput<TElement>
  public getOutput<TResult>(
    scope: Scope,
    select: (
      concise: null | ImpulseFormListOutput<TElement>,
      verbose: ImpulseFormListOutputVerbose<TElement>,
    ) => TResult,
  ): TResult
  public getOutput<TResult = null | ImpulseFormListOutput<TElement>>(
    scope: Scope,
    select: (
      concise: null | ImpulseFormListOutput<TElement>,
      verbose: ImpulseFormListOutputVerbose<TElement>,
    ) => TResult = params._first as typeof select,
  ): TResult {
    const [concise, verbose] = zipMap(
      //
      this._elements.getValue(scope),
      (form) => form.getOutput(scope, params),
    ) as [
      ImpulseFormListOutput<TElement>,
      ImpulseFormListOutputVerbose<TElement>,
    ]

    return select(concise.some(isNull) ? null : concise, verbose)
  }

  public getInput(scope: Scope): ImpulseFormListInput<TElement> {
    const input = this._elements
      .getValue(scope)
      .map((form) => form.getInput(scope))

    return input as ImpulseFormListInput<TElement>
  }

  public setInput(setter: ImpulseFormListInputSetter<TElement>): void {
    setListFormElements(
      this._elements,
      setter,
      (scope) => [this.getInput(scope), this.getInitial(scope)],
      (element, next) => element.setInput(next),
    )
  }

  public getInitial(scope: Scope): ImpulseFormListInput<TElement> {
    const initial = this._initialElements
      .getValue(scope)
      .map((form) => form.getInitial(scope))

    return initial as ImpulseFormListInput<TElement>
  }

  public setInitial(setter: ImpulseFormListInputSetter<TElement>): void {
    batch((scope) => {
      const elements = this._elements.getValue(scope)
      const initialElements = this._initialElements.getValue(scope)

      // get next initial value from setter (initial, input) -> next
      const nextInitial = isFunction(setter)
        ? setter(this.getInitial(scope), this.getInput(scope))
        : setter

      const nextInitialElements = take(
        concat(
          initialElements,
          // fallback the initial elements to the current elements' tail
          drop(elements, initialElements.length),
        ),
        nextInitial.length,
      ).map((element) => {
        return ImpulseForm._childOf(this, element._getInitial(), element)
      })

      for (const [index, element] of nextInitialElements.entries()) {
        const initial = nextInitial.at(index)

        if (!isUndefined(initial)) {
          element.setInitial(initial)
        }
      }

      this._initialElements.setValue(nextInitialElements)
      this._initial.setValue(
        nextInitialElements.map((element) => element._initial),
      )
      this._elements.setValue((elements) => {
        return elements.map((element, index) => {
          return ImpulseForm._childOf(
            this,
            nextInitialElements.at(index)?._initial ?? element._initial,
            element,
          )
        })
      })
    })
  }
}
