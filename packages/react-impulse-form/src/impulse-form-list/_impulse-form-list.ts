import { drop } from "~/tools/drop"
import { isFunction } from "~/tools/is-function"
import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"
import { map } from "~/tools/map"
import { params } from "~/tools/params"
import { replaceElement } from "~/tools/replace-element"
import type { Setter } from "~/tools/setter"
import { take } from "~/tools/take"

import { Impulse, type Scope, batch, untrack } from "../dependencies"
import { ImpulseForm } from "../impulse-form"

import type { ImpulseFormListParams } from "./_impulse-form-list-params"
import { ImpulseFormListState } from "./_impulse-form-list-state"
import type { ImpulseFormListInput } from "./impulse-form-list-input"

export class ImpulseFormList<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TElement extends ImpulseForm = any,
> extends ImpulseForm<ImpulseFormListParams<TElement>> {
  private readonly _initialsSize: Impulse<number>

  private readonly _elementToInitial = new WeakMap<TElement, Impulse<number>>()

  private readonly _elements: Impulse<ReadonlyArray<TElement>>

  // derive the output elements so they are persistent

  public readonly _state: ImpulseFormListState<TElement>

  public constructor(
    parent: null | ImpulseForm,
    private readonly _initial: Impulse<ImpulseFormListInput<TElement>>,
    elements: ReadonlyArray<TElement>,
  ) {
    super(parent)

    this._initialsSize = Impulse(untrack(_initial).length)

    const _elements: Array<TElement> = []

    for (const [index, element] of elements.entries()) {
      const initialIndex = Impulse(index)

      const derivedInitial = Impulse(
        (scope) => {
          return this._initial.getValue(scope).at(initialIndex.getValue(scope))!
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

      const child = this._parentOf(element, derivedInitial)

      this._elementToInitial.set(child, initialIndex)
      _elements.push(child)
    }

    this._elements = Impulse(_elements, {
      compare: isShallowArrayEqual,
    })

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
          return map(this._elements.getValue(scope), ({ _state }) => _state)
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

      this._initial.setValue((initial) => {
        const newInitials = drop(elements, initial.length).map((element) =>
          element._state._initial.getValue(scope),
        )

        if (newInitials.length === 0) {
          return initial
        }

        return [...initial, ...newInitials]
      })

      const nextElements = map(elements, (element, index) => {
        const existingIndex = this._elementToInitial.get(element)

        if (existingIndex) {
          existingIndex.setValue(index)

          return element
        }

        const initialIndex = Impulse(index)

        const derivedInitial = Impulse(
          (scope) => {
            return this._initial
              .getValue(scope)
              .at(initialIndex.getValue(scope))!
          },

          (next, scope) => {
            this._initial.setValue((list) => {
              const i = initialIndex.getValue(scope)

              return replaceElement(list, i, (current) => {
                this._initialsSize.setValue((x) => Math.max(x, i + 1))

                if (element._state._isInputEqual(current, next, scope)) {
                  return current
                }

                return next
              })
            })
          },

          {
            compare: element._state._isInputEqual,
          },
        )

        const child = this._parentOf(element, derivedInitial)

        this._elementToInitial.set(child, initialIndex)

        return this._parentOf(element, derivedInitial)
      })

      this._elements.setValue(nextElements)
    })
  }
}
