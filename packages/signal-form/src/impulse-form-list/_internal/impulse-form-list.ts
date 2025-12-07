import { Impulse, type Monitor, batch } from "@owanturist/signal"

import { entries } from "~/tools/entries"
import { isFunction } from "~/tools/is-function"
import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"
import { map } from "~/tools/map"
import { params } from "~/tools/params"
import type { Setter } from "~/tools/setter"

import { ImpulseForm } from "../../impulse-form/_internal/impulse-form"
import type { ImpulseFormListParams } from "../impulse-form-list-params"

import type { ImpulseFormListState } from "./impulse-form-list-state"

class ImpulseFormList<TElement extends ImpulseForm> extends ImpulseForm<
  ImpulseFormListParams<TElement>
> {
  public static override _getState = ImpulseForm._getState

  private readonly _elements = Impulse((monitor) => this._state._getElements(monitor), {
    equals: isShallowArrayEqual,
  })

  public constructor(public readonly _state: ImpulseFormListState<TElement>) {
    super()
  }

  public getElements(monitor: Monitor): ReadonlyArray<TElement>
  public getElements<TResult>(
    monitor: Monitor,
    select: (elements: ReadonlyArray<TElement>) => TResult,
  ): TResult
  public getElements<TResult>(
    monitor: Monitor,
    select: (elements: ReadonlyArray<TElement>) => TResult = params._first as typeof select,
  ): TResult {
    return select(this._elements.read(monitor))
  }

  public setElements(
    setter: Setter<ReadonlyArray<TElement>, [ReadonlyArray<TElement>, Monitor]>,
  ): void {
    batch((monitor) => {
      const initialElements = this._state._getInitialElements(monitor)

      const elementsStates = map(
        isFunction(setter) ? setter(this._elements.read(monitor), monitor) : setter,

        ImpulseForm._getState,
      )

      const nextStateElements = map(elementsStates, (element) => this._state._parentOf(element))

      // detach all elements from their initial states in one go
      for (const stateElement of nextStateElements) {
        stateElement._replaceInitial(monitor, undefined, false)
      }

      // attach the elements to their updated initial states
      for (const [index, stateElement] of entries(nextStateElements)) {
        stateElement._replaceInitial(
          monitor,
          initialElements.at(index),
          !elementsStates.at(index)?._hasSameRootWith(stateElement),
        )
      }

      this._state._elements.update(nextStateElements)
    })
  }
}

export { ImpulseFormList }
