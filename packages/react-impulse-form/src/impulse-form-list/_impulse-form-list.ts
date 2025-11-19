import { entries } from "~/tools/entries"
import { isFunction } from "~/tools/is-function"
import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"
import { map } from "~/tools/map"
import { params } from "~/tools/params"
import type { Setter } from "~/tools/setter"

import { batch, Impulse, type Scope } from "../dependencies"
import { ImpulseForm } from "../impulse-form"

import type { ImpulseFormListParams } from "./_impulse-form-list-params"
import type { ImpulseFormListState } from "./_impulse-form-list-state"

export class ImpulseFormList<TElement extends ImpulseForm> extends ImpulseForm<
  ImpulseFormListParams<TElement>
> {
  public static override _getState = ImpulseForm._getState

  private readonly _elements = Impulse((scope) => this._state._getElements(scope), {
    compare: isShallowArrayEqual,
  })

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
    select: (elements: ReadonlyArray<TElement>) => TResult = params._first as typeof select,
  ): TResult {
    return select(this._elements.getValue(scope))
  }

  public setElements(
    setter: Setter<ReadonlyArray<TElement>, [ReadonlyArray<TElement>, Scope]>,
  ): void {
    batch((scope) => {
      const initialElements = this._state._getInitialElements(scope)

      const elementsStates = map(
        isFunction(setter) ? setter(this._elements.getValue(scope), scope) : setter,

        ImpulseForm._getState,
      )

      const nextStateElements = map(elementsStates, (element) => this._state._parentOf(element))

      // detach all elements from their initial states in one go
      for (const stateElement of nextStateElements) {
        stateElement._replaceInitial(scope, undefined, false)
      }

      // attach the elements to their updated initial states
      for (const [index, stateElement] of entries(nextStateElements)) {
        stateElement._replaceInitial(
          scope,
          initialElements.at(index),
          !elementsStates.at(index)?._hasSameRootWith(stateElement),
        )
      }

      this._state._elements.setValue(nextStateElements)
    })
  }
}
