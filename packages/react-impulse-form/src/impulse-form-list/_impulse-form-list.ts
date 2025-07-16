import type { Lazy } from "~/tools/lazy"
import { None, Option } from "~/tools/option"
import { params } from "~/tools/params"
import { type Setter, resolveSetter } from "~/tools/setter"

import type { Impulse, Scope } from "../dependencies"
import { ImpulseForm } from "../impulse-form"

import type { ImpulseFormListParams } from "./_impulse-form-list-params"
import type { ImpulseFormListSpec } from "./_impulse-form-list-spec"
import type { ImpulseForListState } from "./_impulse-form-list-state"

export class ImpulseFormList<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TElement extends ImpulseForm = any,
> extends ImpulseForm<ImpulseFormListParams<TElement>> {
  public constructor(
    public readonly _spec: Impulse<ImpulseFormListSpec<TElement>>,
    public readonly _state: Lazy<ImpulseForListState<TElement>>,
    private readonly _elements: Impulse<ReadonlyArray<TElement>>,
  ) {
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
    this._elements.setValue((elements, scope) => {
      const spec = this._spec.getValue(scope)

      return resolveSetter(setter, elements, scope).map((element, index) => {
        if (element._state._peek()._parent) {
          return element
        }

        const initial = spec._elements
          .at(index)
          ?.getValue(scope)
          ._initial.getValue(scope)

        return element._spec
          .getValue(scope)
          ._override({
            _initial: Option(initial),
            _input: None,
            _error: None,
            _validateOn: None,
            _touched: None,
          })
          ._create(this._state)
      })
    })
  }
}
