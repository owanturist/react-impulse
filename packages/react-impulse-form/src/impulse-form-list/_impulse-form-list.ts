import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"
import { Lazy } from "~/tools/lazy"
import { map } from "~/tools/map"
import { params } from "~/tools/params"
import { type Setter, resolveSetter } from "~/tools/setter"

import { Impulse, type Scope, untrack } from "../dependencies"
import { ImpulseForm } from "../impulse-form"

import type { ImpulseFormListParams } from "./_impulse-form-list-params"
import type { ImpulseFormListSpec } from "./_impulse-form-list-spec"
import { ImpulseForListState } from "./_impulse-form-list-state"

export class ImpulseFormList<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TElement extends ImpulseForm = any,
> extends ImpulseForm<ImpulseFormListParams<TElement>> {
  public readonly _state: Lazy<ImpulseForListState<TElement>>
  private readonly _elements: Impulse<ReadonlyArray<TElement>>

  public constructor(
    root: null | ImpulseForm,
    public readonly _spec: ImpulseFormListSpec<TElement>,
  ) {
    super(root)

    this._elements = Impulse(
      map(untrack(_spec._elements), (element, index) => {
        return element._childOf(
          this,
          Impulse(
            (scope) => _spec._initial.getValue(scope)[index],
            (initial) => {
              _spec._initial.setValue((elementsInitial) => {
                return elementsInitial.map((elementInitial, i) => {
                  if (i === index) {
                    return initial
                  }

                  return elementInitial
                })
              })
            },
          ),
        )
      }),
      {
        compare: isShallowArrayEqual,
      },
    )

    this._state = Lazy(() => {
      return new ImpulseForListState(
        Impulse(
          (scope) => {
            return map(this._elements.getValue(scope), ({ _state }) => {
              return _state._peek()
            })
          },
          {
            compare: isShallowArrayEqual,
          },
        ),
      )
    })
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
      return resolveSetter(setter, elements, scope).map((element, index) => {
        if (this._hasSameRootWith(element)) {
          return element
        }

        const specElement = this._spec._elements.getValue(scope).at(index)

        return element._spec._childOf(
          this,
          specElement ? specElement._initial : element._spec._initial,
        )
      })
    })
  }
}
