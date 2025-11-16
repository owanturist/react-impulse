import type { Setter } from "~/tools/setter"

import type { ValidateStrategy } from "../validate-strategy"

import type { GetImpulseFormShapeParam } from "./get-impulse-form-shape-param"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"
import type { ImpulseFormShapeValidateOnVerbose } from "./impulse-form-shape-validate-on-verbose"

export type ImpulseFormShapeValidateOnSetter<TFields extends ImpulseFormShapeFields> = Setter<
  ValidateStrategy | Partial<GetImpulseFormShapeParam<TFields, "validateOn.setter">>,
  [ImpulseFormShapeValidateOnVerbose<TFields>]
>
