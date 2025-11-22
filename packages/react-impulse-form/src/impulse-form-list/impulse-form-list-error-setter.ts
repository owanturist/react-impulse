import type { Setter } from "~/tools/setter"

import type { GetImpulseFormErrorSetter, ImpulseForm } from "../impulse-form"

import type { ImpulseFormListErrorVerbose } from "./impulse-form-list-error-verbose"

type ImpulseFormListErrorSetter<TElement extends ImpulseForm> = Setter<
  null | ReadonlyArray<undefined | GetImpulseFormErrorSetter<TElement>>,
  [ImpulseFormListErrorVerbose<TElement>]
>

export type { ImpulseFormListErrorSetter }
