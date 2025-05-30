import type { Setter } from "~/tools/setter"

import type { GetImpulseFormInput, ImpulseForm } from "../impulse-form"

import type { ImpulseFormListInput } from "./impulse-form-list-input"

export type ImpulseFormListInputSetter<TElement extends ImpulseForm> = Setter<
  ReadonlyArray<undefined | GetImpulseFormInput<TElement>>,
  [ImpulseFormListInput<TElement>, ImpulseFormListInput<TElement>]
>
