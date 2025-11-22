import type { Setter } from "~/tools/setter"

import type { GetImpulseFormFlagSetter } from "../impulse-form/get-impulse-form-flag-setter"
import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { ImpulseFormListFlagVerbose } from "./impulse-form-list-flag-verbose"

type ImpulseFormListFlagSetter<TElement extends ImpulseForm> = Setter<
  boolean | ReadonlyArray<undefined | GetImpulseFormFlagSetter<TElement>>,
  [ImpulseFormListFlagVerbose<TElement>]
>

export type { ImpulseFormListFlagSetter }
