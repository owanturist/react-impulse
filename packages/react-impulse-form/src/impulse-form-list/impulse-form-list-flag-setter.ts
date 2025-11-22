import type { Setter } from "~/tools/setter"

import type { GetImpulseFormFlagSetter, ImpulseForm } from "../impulse-form"

import type { ImpulseFormListFlagVerbose } from "./impulse-form-list-flag-verbose"

type ImpulseFormListFlagSetter<TElement extends ImpulseForm> = Setter<
  boolean | ReadonlyArray<undefined | GetImpulseFormFlagSetter<TElement>>,
  [ImpulseFormListFlagVerbose<TElement>]
>

export type { ImpulseFormListFlagSetter }
