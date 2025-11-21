import type { Setter } from "~/tools/setter"

import type { GetImpulseFormErrorSetter } from "../impulse-form/get-impulse-form-error-setter"
import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { ImpulseFormListErrorVerbose } from "./impulse-form-list-error-verbose"

export type ImpulseFormListErrorSetter<TElement extends ImpulseForm> = Setter<
  null | ReadonlyArray<undefined | GetImpulseFormErrorSetter<TElement>>,
  [ImpulseFormListErrorVerbose<TElement>]
>
