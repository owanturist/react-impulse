import { isArray } from "~/tools/is-array"
import { isFunction } from "~/tools/is-function"
import { isUndefined } from "~/tools/is-undefined"
import type { Setter } from "~/tools/setter"

import { type Impulse, type Scope, batch } from "../dependencies"
import type { ImpulseForm } from "../impulse-form"

export function setListFormElements<
  TElement extends ImpulseForm,
  TElementSetter,
  TElementValueLeft,
  TElementValueRight,
  TGenericValue = never,
>(
  elements: Impulse<ReadonlyArray<TElement>>,
  setter: Setter<
    TGenericValue | ReadonlyArray<undefined | TElementSetter>,
    [TElementValueLeft, TElementValueRight]
  >,
  getCurrent: (scope: Scope) => [TElementValueLeft, TElementValueRight],
  setNext: (element: TElement, next: TGenericValue | TElementSetter) => void,
): void

export function setListFormElements<
  TElement extends ImpulseForm,
  TElementSetter,
  TElementValue,
  TGenericValue = never,
>(
  elements: Impulse<ReadonlyArray<TElement>>,
  setter: Setter<
    TGenericValue | ReadonlyArray<undefined | TElementSetter>,
    [TElementValue]
  >,
  getCurrent: (scope: Scope) => [TElementValue],
  setNext: (element: TElement, next: TGenericValue | TElementSetter) => void,
): void

export function setListFormElements<
  TElement extends ImpulseForm,
  TElementSetter,
  TElementValueLeft,
  TElementValueRight,
  TGenericValue = never,
>(
  elements: Impulse<ReadonlyArray<TElement>>,
  setter: Setter<
    TGenericValue | ReadonlyArray<undefined | TElementSetter>,
    [TElementValueLeft, TElementValueRight?]
  >,
  getCurrent: (scope: Scope) => [TElementValueLeft, TElementValueRight?],
  setNext: (element: TElement, next: TGenericValue | TElementSetter) => void,
): void {
  batch((scope) => {
    const nextValue = isFunction(setter) ? setter(...getCurrent(scope)) : setter

    for (const [index, element] of elements.getValue(scope).entries()) {
      const next = isArray(nextValue) ? nextValue.at(index) : nextValue

      if (!isUndefined(next)) {
        setNext(element, next)
      }
    }
  })
}
