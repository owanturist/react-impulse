import type { Lazy } from "~/tools/lazy"
import { params } from "~/tools/params"
import type { Setter } from "~/tools/setter"

import type { Impulse, Scope } from "../dependencies"
import { ImpulseForm } from "../impulse-form"
import type { ImpulseFormSpec } from "../impulse-form/impulse-form-spec"

import type { ImpulseFormListParams } from "./_impulse-form-list-params"
import type { ImpulseForListState } from "./_impulse-form-list-state"

export class ImpulseFormList<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TElement extends ImpulseForm = any,
> extends ImpulseForm<ImpulseFormListParams<TElement>> {
  public constructor(
    public readonly _spec: Impulse<
      ImpulseFormSpec<ImpulseFormListParams<TElement>>
    >,
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
    this._elements.setValue(setter)
  }
}
