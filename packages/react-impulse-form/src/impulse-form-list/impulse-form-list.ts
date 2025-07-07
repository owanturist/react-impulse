import { Option } from "~/tools/option"

import type { ImpulseForm } from "../impulse-form"

import type { ImpulseFormList as ImpulseFormListImpl } from "./_impulse-form-list"
import { ImpulseFormListSpec } from "./_impulse-form-list-spec"
import type { ImpulseFormListErrorSetter } from "./impulse-form-list-error-setter"
import type { ImpulseFormListFlagSetter } from "./impulse-form-list-flag-setter"
import type { ImpulseFormListInputSetter } from "./impulse-form-list-input-setter"
import type { ImpulseFormListValidateOnSetter } from "./impulse-form-list-validate-on-setter"

export type ImpulseFormList<TElement extends ImpulseForm> =
  ImpulseFormListImpl<TElement>

export interface ImpulseFormListOptions<TElement extends ImpulseForm> {
  readonly input?: ImpulseFormListInputSetter<TElement>
  readonly initial?: ImpulseFormListInputSetter<TElement>
  readonly touched?: ImpulseFormListFlagSetter<TElement>
  readonly validateOn?: ImpulseFormListValidateOnSetter<TElement>
  readonly error?: ImpulseFormListErrorSetter<TElement>
}

export function ImpulseFormList<TElement extends ImpulseForm>(
  elements: ReadonlyArray<TElement>,
  {
    input,
    initial,
    touched,
    validateOn,
    error,
  }: ImpulseFormListOptions<TElement> = {},
): ImpulseFormList<TElement> {
  return new ImpulseFormListSpec(elements.map(({ _spec }) => _spec))
    ._override({
      _input: Option(input),
      _initial: Option(initial),
      _error: Option(error),
      _touched: Option(touched),
      _validateOn: Option(validateOn),
    })
    ._create()
}
