import type { Setter } from "~/tools/setter"

import type { ValidateStrategy } from "../validate-strategy"

import type { GetFormShapeParam } from "./get-impulse-form-shape-param"
import type { FormShapeFields } from "./impulse-form-shape-fields"
import type { FormShapeValidateOnVerbose } from "./impulse-form-shape-validate-on-verbose"

type FormShapeValidateOnSetter<TFields extends FormShapeFields> = Setter<
  ValidateStrategy | Partial<GetFormShapeParam<TFields, "validateOn.setter">>,
  [FormShapeValidateOnVerbose<TFields>]
>

export type { FormShapeValidateOnSetter }
