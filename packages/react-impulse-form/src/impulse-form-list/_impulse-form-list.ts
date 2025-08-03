import { isFunction } from "~/tools/is-function"
import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"
import { map } from "~/tools/map"
import { params } from "~/tools/params"
import type { Setter } from "~/tools/setter"

import { Impulse, type Scope, batch } from "../dependencies"
import { ImpulseForm } from "../impulse-form"

import type { ImpulseFormListParams } from "./_impulse-form-list-params"
import type { ImpulseFormListState } from "./_impulse-form-list-state"

export class ImpulseFormList<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TElement extends ImpulseForm = any,
> extends ImpulseForm<ImpulseFormListParams<TElement>> {
  private readonly _elements = Impulse(
    (scope) => this._state._getElements(scope),
    {
      compare: isShallowArrayEqual,
    },
  )

  public constructor(public readonly _state: ImpulseFormListState<TElement>) {
    super()
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
      const nextElements = map(
        isFunction(setter)
          ? setter(this._elements.getValue(scope), scope)
          : setter,

        ({ _state }) => _state._childOf(this._state),
      )

      const initialElements = this._state._initialElements.getValue(scope)

      nextElements.forEach((element, index) => {
        element._replaceInitial(scope, initialElements.at(index))
      })

      this._state._elements.setValue(nextElements)
    })
  }
}
