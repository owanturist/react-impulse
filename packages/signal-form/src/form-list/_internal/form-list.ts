import { type Monitor, Signal, batch } from "@owanturist/signal"

import { entries } from "~/tools/entries"
import { isFunction } from "~/tools/is-function"
import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"
import { map } from "~/tools/map"
import { params } from "~/tools/params"
import type { Setter } from "~/tools/setter"

import { SignalForm } from "../../signal-form/_internal/signal-form"
import type { FormListParams } from "../form-list-params"

import type { FormListState } from "./form-list-state"

class FormList<TElement extends SignalForm> extends SignalForm<FormListParams<TElement>> {
  public static override _getState = SignalForm._getState

  private readonly _elements = Signal((monitor) => this._state._getElements(monitor), {
    equals: isShallowArrayEqual,
  })

  public constructor(public readonly _state: FormListState<TElement>) {
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

        SignalForm._getState,
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

export { FormList }
