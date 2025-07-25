import { isDefined } from "~/tools/is-defined"
import { isFunction } from "~/tools/is-function"
import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"
import { map } from "~/tools/map"
import { params } from "~/tools/params"
import { replaceElement } from "~/tools/replace-element"
import type { Setter } from "~/tools/setter"
import { take } from "~/tools/take"
import { takeWhile } from "~/tools/take-while"

import { Impulse, type Scope, batch, untrack } from "../dependencies"
import { ImpulseForm } from "../impulse-form"

import type { ImpulseFormListParams } from "./_impulse-form-list-params"
import { ImpulseFormListState } from "./_impulse-form-list-state"
import type { ImpulseFormListInput } from "./impulse-form-list-input"

class ImpulseFormListElement<TElement extends ImpulseForm> {
  public constructor(
    public readonly _element: TElement,
    public readonly _initialIndex: Impulse<number>,
  ) {}
}

export class ImpulseFormList<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TElement extends ImpulseForm = any,
> extends ImpulseForm<ImpulseFormListParams<TElement>> {
  private readonly _initialsSize: Impulse<number>

  private readonly _listElements: Impulse<
    ReadonlyArray<ImpulseFormListElement<TElement>>
  >

  // derive the output elements so they are persistent
  private readonly _elements = Impulse(
    (scope) => {
      const elements = this._listElements
        .getValue(scope)
        .map(({ _element }) => _element)

      return takeWhile(elements, isDefined<TElement>)
    },
    {
      compare: isShallowArrayEqual,
    },
  )

  public readonly _state: ImpulseFormListState<TElement>

  public constructor(
    parent: null | ImpulseForm,
    private readonly _initial: Impulse<ImpulseFormListInput<TElement>>,
    elements: ReadonlyArray<TElement>,
  ) {
    super(parent)

    this._initialsSize = Impulse(untrack(_initial).length)

    this._listElements = Impulse(
      map(elements, (element, index) => {
        const initialIndex = Impulse(index)

        const derivedInitial = Impulse(
          (scope) => {
            return this._initial
              .getValue(scope)
              .at(initialIndex.getValue(scope))!
          },

          (next, scope) => {
            this._initial.setValue((list) => {
              return replaceElement(
                list,
                initialIndex.getValue(scope),
                (current) => {
                  if (element._state._isInputEqual(current, next, scope)) {
                    return current
                  }

                  return next
                },
              )
            })
          },

          {
            compare: element._state._isInputEqual,
          },
        )

        return new ImpulseFormListElement(
          this._parentOf(element, derivedInitial),
          initialIndex,
        )
      }),
      {
        compare: isShallowArrayEqual,
      },
    )

    this._state = new ImpulseFormListState(
      Impulse(
        (scope) => {
          return take(
            this._initial.getValue(scope),
            this._initialsSize.getValue(scope),
          )
        },
        {
          compare: isShallowArrayEqual,
        },
      ),

      Impulse(
        (scope) => {
          return map(
            this._listElements.getValue(scope),
            ({ _element }) => _element._state,
          )
        },
        {
          compare: isShallowArrayEqual,
        },
      ),
    )
  }

  protected _childOf(
    parent: ImpulseForm,
    initial: Impulse<ImpulseFormListInput<TElement>>,
  ): ImpulseForm<ImpulseFormListParams<TElement>> {
    return new ImpulseFormList(parent, initial, untrack(this._elements))
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
    batch((scope) => {
      const elements = isFunction(setter)
        ? setter(this._elements.getValue(scope), scope)
        : setter

      const listElements = map(elements, (element, index) => {
        const initialIndex = Impulse(index)

        const derivedInitial = Impulse(
          (scope) => {
            return this._initial
              .getValue(scope)
              .at(initialIndex.getValue(scope))!
          },

          (next, scope) => {
            this._initial.setValue((list) => {
              return replaceElement(
                list,
                initialIndex.getValue(scope),
                (current) => {
                  if (element._state._isInputEqual(current, next, scope)) {
                    return current
                  }

                  return next
                },
              )
            })
          },

          {
            compare: element._state._isInputEqual,
          },
        )

        return new ImpulseFormListElement(
          this._parentOf(element, derivedInitial),
          initialIndex,
        )
      })

      this._listElements.setValue(listElements)
    })
  }
}
