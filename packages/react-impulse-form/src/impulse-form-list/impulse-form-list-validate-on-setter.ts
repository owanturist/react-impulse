import type { Setter } from "~/tools/setter"

import type { GetImpulseFormValidateOnSetter, ImpulseForm } from "../impulse-form"
import type { ValidateStrategy } from "../validate-strategy"

import type { ImpulseFormListValidateOnVerbose } from "./impulse-form-list-validate-on-verbose"

type ImpulseFormListValidateOnSetter<TElement extends ImpulseForm> = Setter<
  ValidateStrategy | ReadonlyArray<undefined | GetImpulseFormValidateOnSetter<TElement>>,
  [ImpulseFormListValidateOnVerbose<TElement>]
>

export type { ImpulseFormListValidateOnSetter }
