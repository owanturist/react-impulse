import type { Setter } from "~/tools/setter"

import type { ValidateStrategy } from "../validate-strategy"

import type { FormShapeFields } from "./form-shape-fields"
import type { FormShapeValidateOnVerbose } from "./form-shape-validate-on-verbose"
import type { GetFormShapeParam } from "./get-form-shape-param"

type FormShapeValidateOnSetter<TFields extends FormShapeFields> = Setter<
  ValidateStrategy | Partial<GetFormShapeParam<TFields, "validateOn.setter">>,
  [FormShapeValidateOnVerbose<TFields>]
>

export type { FormShapeValidateOnSetter }
