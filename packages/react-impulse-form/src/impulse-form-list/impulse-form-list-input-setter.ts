import type { Setter } from "~/tools/setter"

import type { GetImpulseFormInputSetter, ImpulseForm } from "../impulse-form"

import type { ImpulseFormListInput } from "./impulse-form-list-input"

export type ImpulseFormListInputSetter<TElement extends ImpulseForm> = Setter<
  ReadonlyArray<undefined | GetImpulseFormInputSetter<TElement>>,
  [ImpulseFormListInput<TElement>, ImpulseFormListInput<TElement>]
>
