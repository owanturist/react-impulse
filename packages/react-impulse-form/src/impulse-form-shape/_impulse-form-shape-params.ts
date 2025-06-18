import type { ImpulseFormParams } from "../impulse-form"

import type { ImpulseFormShapeError } from "./impulse-form-shape-error"
import type { ImpulseFormShapeErrorSetter } from "./impulse-form-shape-error-setter"
import type { ImpulseFormShapeErrorVerbose } from "./impulse-form-shape-error-verbose"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"
import type { ImpulseFormShapeFlag } from "./impulse-form-shape-flag"
import type { ImpulseFormShapeFlagSetter } from "./impulse-form-shape-flag-setter"
import type { ImpulseFormShapeFlagVerbose } from "./impulse-form-shape-flag-verbose"
import type { ImpulseFormShapeInput } from "./impulse-form-shape-input"
import type { ImpulseFormShapeInputSetter } from "./impulse-form-shape-input-setter"
import type { ImpulseFormShapeOutput } from "./impulse-form-shape-output"
import type { ImpulseFormShapeOutputVerbose } from "./impulse-form-shape-output-verbose"
import type { ImpulseFormShapeValidateOn } from "./impulse-form-shape-validate-on"
import type { ImpulseFormShapeValidateOnSetter } from "./impulse-form-shape-validate-on-setter"
import type { ImpulseFormShapeValidateOnVerbose } from "./impulse-form-shape-validate-on-verbose"

export interface ImpulseFormShapeParams<
  TFields extends ImpulseFormShapeFields = ImpulseFormShapeFields,
> extends ImpulseFormParams {
  "input.schema": ImpulseFormShapeInput<TFields>
  "input.setter": ImpulseFormShapeInputSetter<TFields>

  "output.schema": ImpulseFormShapeOutput<TFields>
  "output.schema.verbose": ImpulseFormShapeOutputVerbose<TFields>

  "flag.setter": ImpulseFormShapeFlagSetter<TFields>
  "flag.schema": ImpulseFormShapeFlag<TFields>
  "flag.schema.verbose": ImpulseFormShapeFlagVerbose<TFields>

  "validateOn.setter": ImpulseFormShapeValidateOnSetter<TFields>
  "validateOn.schema": ImpulseFormShapeValidateOn<TFields>
  "validateOn.schema.verbose": ImpulseFormShapeValidateOnVerbose<TFields>

  "error.setter": ImpulseFormShapeErrorSetter<TFields>
  "error.schema": ImpulseFormShapeError<TFields>
  "error.schema.verbose": ImpulseFormShapeErrorVerbose<TFields>
}
